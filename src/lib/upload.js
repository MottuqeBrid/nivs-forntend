const isImageFile = (file) => file.type.startsWith("image/");

const uploadImage = async (app, file, onProgress) => {
  const formData = new FormData();
  formData.append("files", file);

  const url = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress?.(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.success) {
          resolve(data.files[0].url);
        } else {
          reject(new Error(data.message || "Image upload failed"));
        }
      } catch {
        reject(new Error("Invalid response from server"));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(formData);
  });

  return url;
};

const uploadFile = async (app, file, onProgress, typeOverride) => {
  const { data: signed } = await app.post(`upload/signed-url`, {
    originalName: file.name,
    contentType: file.type,
  });

  if (!signed.success) throw new Error(signed.message);

  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signed.signedUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress?.(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error("Direct upload to storage failed"));
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });

  const type =
    typeOverride ||
    (file.type.startsWith("video/") ? "video" : "file");

  const { data: confirmed } = await app.post("upload/confirm", {
    filename: signed.filename,
    originalName: file.name,
    url: signed.publicUrl,
    type,
  });

  if (!confirmed.success) throw new Error(confirmed.message);
  return confirmed.file.url;
};

const uploadToStorage = async (app, file, onProgress, typeOverride) => {
  if (isImageFile(file)) {
    return uploadImage(app, file, onProgress);
  }
  return uploadFile(app, file, onProgress, typeOverride);
};

export { uploadToStorage };
