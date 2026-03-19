window.addEventListener("load", (event) => {
  console.log("page is fully loaded");

  getData()
});

async function getData() {
  const url = "http://127.0.0.1:5000/followers";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error(error.message);
  }
}

async function sendJob() {
  const url = "http://127.0.0.1:5000/followers"

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error(error.message);
  }
}