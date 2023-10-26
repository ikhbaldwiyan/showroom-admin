const axios = require("axios");
const cheerio = require("cheerio");

exports.getTheaterSchedule = async (req, res) => {
  try {
    const response = await axios.get("https://jkt48.com/theater/schedule");
    const $ = cheerio.load(response.data);

    const schedules = [];

    $(".entry-mypage__history tbody tr").each((index, element) => {
      const dateTimeString = $(element).find('td:first-child').text().trim();
      const dateRegex = /(\d{1,2}\.\d{1,2}\.\d{4})/; // Matches "dd.mm.yyyy"
      const timeRegex = /(\d{1,2}:\d{2})/; // Matches "hh:mm"

      const dateMatch = dateTimeString.match(dateRegex);
      const timeMatch = dateTimeString.match(timeRegex);

      const date = dateMatch ? dateMatch[1] : null;
      const time = timeMatch ? timeMatch[1] : null;

      const setlist = $(element).find('td:nth-child(2)').text().trim();
      const members = $(element).find('td:nth-child(3)').text().trim().split(',').map(member => member.trim());

      schedules.push({
        date: date,
        time: time,
        setlist: setlist,
        members: members
      });
    });

    res.json(schedules?.slice(-2));
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const convertRupiah = (value = 0) => {
  if (value === null) {
    value = 0;
  }
  const rupiah = value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.");
  return `Rp ${rupiah}`;
};

exports.getPremiumLiveHistory = async (req, res) => {
  try {
    const response = await axios.get(
      "https://www.showroom-live.com/paid_live/hist",
      {
        headers: {
          Cookie: req.body.token,
        },
      }
    );
    const $ = cheerio.load(response.data);
    const results = [];

    $(".paid-live-schedule").each((index, element) => {
      const title = $(element).find(".paid-live-title a").text().trim();
      const link = $(element).find(".paid-live-title a").attr("href");
      const price = $(element)
        .find(".paid-live-info-default-price .paid-live-info-item-value")
        .text()
        .trim();

      results.push({
        title: title,
        link: link,
        price: price,
      });
    });

    let totalPrice = 0;
    const exchangeRate = 10.6;

    results.map((item) => {
      return (totalPrice += parseInt(item.price.replace(" JPY", "")));
    });

    const filterShowTheater = (title) => {
      const show = results
        .map((item) => {
          if (item.title.includes(title)) {
            return item;
          }
        })
        .filter(Boolean);
    
      return show;
    };

    res.json({
      summary: {
        totalPaidLive: results.length,
        totalJPY: totalPrice,
        totalIDR: convertRupiah(`${totalPrice * exchangeRate}0`),
        show: {
          rkj: filterShowTheater("Aturan Anti Cinta").length,
          ramune: filterShowTheater("Ramune").length,
          aitakata: filterShowTheater("Ingin Bertemu").length,
          snm: filterShowTheater("Tunas").length,
          banzai: filterShowTheater("Banzai").length,
          pajama: filterShowTheater("Pajama").length,
          anniv: filterShowTheater("Anniv").length,
        },
      },
      results,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
