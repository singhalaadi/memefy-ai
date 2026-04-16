/**
 * Cloudinary avatar upload utility.
 *
 * Uses an UNSIGNED upload preset — this is the correct & secure approach
 * for client-side uploads. The API Key/Secret are for server-side signed
 * operations only and must NEVER be placed in frontend code.
 *
 * Config lives in .env:
 *   VITE_CLOUDINARY_CLOUD_NAME
 *   VITE_CLOUDINARY_UPLOAD_PRESET
 *   VITE_CLOUDINARY_FOLDER
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const FOLDER = import.meta.env.VITE_CLOUDINARY_FOLDER;

/**
 * Upload an image File to Cloudinary and return its secure URL.
 * @param {File} file
 * @returns {Promise<string>} Cloudinary secure URL
 */
export const uploadAvatarToCloudinary = async (file) => {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Cloudinary env vars not set. Check VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  if (FOLDER) formData.append("folder", FOLDER);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Upload failed (${res.status})`);
  }

  const data = await res.json();
  return data.secure_url;
};
