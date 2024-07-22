export const getKeys = async () => {
  const url = "https://raw.githubusercontent.com/Ciarands/vidsrc-keys/main/keys.json";

  try {
    const response = await fetch(url);
    if (response.status !== 200) {
      console.error("Failed to fetch decryption keys:", response.statusText);
      return null;
    }

    const keys = await response.json();

    if (keys && keys.encrypt && keys.decrypt) {
      const allKeys = [...keys.encrypt, ...keys.decrypt];
      return allKeys;
    } else {
      console.error("Keys object is empty or malformed");
      return null;
    }
  } catch (error) {
    console.error("Error:", error.message);
    return null;
  }
};
