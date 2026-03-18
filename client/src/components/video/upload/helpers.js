export function formatBytes(bytes) {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function pluralRu(n) {
    if (n % 10 === 1 && n % 100 !== 11) return "";
    if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return "а";
    return "ов";
}
