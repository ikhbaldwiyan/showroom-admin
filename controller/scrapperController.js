const axios = require("axios");
const cheerio = require("cheerio");

exports.getTheaterSchedule = async (req, res) => {
  try {
    const response = await axios.get("https://jkt48.com/theater/schedule");
    const $ = cheerio.load(response.data);

    const schedules = [];

    $(".entry-mypage__history tbody tr").each((index, element) => {
      const dateTimeString = $(element).find("td:first-child").text().trim();
      const dateRegex = /(\d{1,2}\.\d{1,2}\.\d{4})/; // Matches "dd.mm.yyyy"
      const timeRegex = /(\d{1,2}:\d{2})/; // Matches "hh:mm"

      const dateMatch = dateTimeString.match(dateRegex);
      const timeMatch = dateTimeString.match(timeRegex);

      const date = dateMatch ? dateMatch[1] : null;
      const time = timeMatch ? timeMatch[1] : null;

      const setlist = $(element).find("td:nth-child(2)").text().trim();
      const members = $(element)
        .find("td:nth-child(3)")
        .text()
        .trim()
        .split(",")
        .map((member) => member.trim());

      schedules.push({
        date: date,
        time: time,
        setlist: setlist,
        members: members,
      });
    });

    res.json(schedules);
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

    const name = $(".pc-header-mypage-name")
      .text()
      .replace(/^\s+|\s+$/g, "");
    const image = $(".pc-header-mypage-image").attr("src");
    const level = $(".pc-header-mypage-level")
      .text()
      .replace(/^\s+|\s+$/g, "");

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
        user: {
          name,
          image,
          level,
        },
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

exports.getMostVisitRoom = async (req, res) => {
  try {
    let roomIds = [];
    const roomList = await axios.get(
      "https://jkt48-showroom-api.vercel.app/api/rooms"
    );
    roomList.data.map((item) => {
      roomIds.push(item.id);
    });

    const roomListGen10 = await axios.get(
      "https://jkt48-showroom-api.vercel.app/api/rooms/academy"
    );
    roomListGen10.data.map((item) => {
      roomIds.push(item.room_id);
    });

    const roomListTrainee = await axios.get(
      "https://jkt48-showroom-api.vercel.app/api/rooms/trainee"
    );
    roomListTrainee.data.map((item) => {
      roomIds.push(item.room_id);
    });

    const promises = Object.values(roomIds).map(async (room_id) => {
      const response = await axios.post(
        "https://laravel-showroom-api.vercel.app/api/profile/room",
        {
          room_id: room_id,
          cookie: req.body.token,
        }
      );

      return response.data;
    });

    const room = await Promise.all(promises);

    const mostVisitRoom = room.map((item) => {
      return {
        name: item?.main_name,
        image: item?.image_square,
        visit: item?.visit_count,
      };
    });

    res.send(mostVisitRoom);
  } catch (error) {
    console.log(error);
  }
};
