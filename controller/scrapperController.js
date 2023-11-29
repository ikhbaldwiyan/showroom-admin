const axios = require("axios");
const cheerio = require("cheerio");
const API = "https://jkt48-showroom-apis.vercel.app/api";

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

    const shows = [
      "Cara Meminum Ramune",
      "Aturan Anti Cinta",
      "Ingin Bertemu",
      "Tunas di Balik Seragam",
      "Banzai",
      "Pajama Drive",
      "11th Anniversary Event",
    ];

    const showInfo = shows
      .map((show) => ({
        name: show,
        total: filterShowTheater(show).length,
      }))
      .sort((a, b) => b.total - a.total);

    res.json({
      user: {
        name,
        image,
        level,
      },
      topSetlist:
        "https://media.discordapp.net/attachments/1108380195175551047/1169569783528833074/a0d68478-a16a-4b8b-a722-d1a2027bd5d8-transformed_1.jpeg?ex=6555e1bd&is=65436cbd&hm=2913d772f62f381bf42e62c640e1062d48734049f40b67402fa89e89b0019571&=&width=950&height=607",
      totalPaidLive: results.length,
      totalJPY: totalPrice,
      totalIDR: convertRupiah(`${totalPrice * exchangeRate}0`),
      show: showInfo,
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
    const roomList = await axios.get(`${API}/rooms`);
    roomList.data.map((item) => {
      roomIds.push(item.id);
    });

    const roomListGen10 = await axios.get(`${API}/rooms/academy`);
    roomListGen10.data.map((item) => {
      roomIds.push(item.room_id);
    });

    const roomListTrainee = await axios.get(`${API}/rooms/trainee`);
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

    const mostVisitRoom = room
      .map((item) => {
        return {
          name: item?.room_url_key?.replace("JKT48_", ""),
          image: item?.image_square?.replace("_m.jpeg", "_l.jpeg"),
          visit: item?.visit_count,
        };
      })
      .sort((a, b) => b.visit - a.visit);

    res.send(mostVisitRoom);
  } catch (error) {
    console.log(error);
  }
};
