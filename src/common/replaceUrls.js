export function useReplaceUrls() {
    function replaceUrls(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, '<a href="$&" target="_blank">$&</a>');
    }
    return { replaceUrls }
}