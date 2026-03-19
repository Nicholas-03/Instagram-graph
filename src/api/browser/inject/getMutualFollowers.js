(() => {
  async function getMutualFollowers() {
    try {
      const res = await fetch(
        "https://www.instagram.com/api/v1/friendships/1271508981/mutual_followers/?page_size=50",
        {
          method: "GET",
          headers: {
            "x-ig-app-id": "936619743392459",
          }
        }
      );

      const text = await res.text();

      console.log("status:", res.status);
      console.log("ok:", res.ok);

      try {
        const json = JSON.parse(text);
        console.log("response json:", json);
        console.log(JSON.stringify(json, null, 2));
      } catch {
        console.log("response text:", text);
      }
    } catch (err) {
      console.error("request error:", err);
    }
  }

  getMutualFollowers();
})();
