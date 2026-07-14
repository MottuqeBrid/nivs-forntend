const uploadToStorage = async (app, file, onProgress, typeOverride) => {
  const { data: signed } = await app.post("upload/signed-url", {
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
    (file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
        ? "video"
        : "file");

  const { data: confirmed } = await app.post("upload/confirm", {
    filename: signed.filename,
    originalName: file.name,
    url: signed.publicUrl,
    type,
  });

  if (!confirmed.success) throw new Error(confirmed.message);
  return confirmed.file.url;
};

export { uploadToStorage };
