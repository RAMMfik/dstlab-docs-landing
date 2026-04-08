export function getStorageInfo() {
  const driver = (process.env.STORAGE_DRIVER || "local").toLowerCase();

  return {
    driver: driver === "s3" ? "s3" : "local",
    isS3: driver === "s3",
    isLocal: driver !== "s3",
    configured: driver === "s3"
      ? Boolean(process.env.S3_BUCKET)
      : true,
  };
}