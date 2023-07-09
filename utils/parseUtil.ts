export function parseUrls (urls: string[], baseUrl: string): string {
    const newUrls = [...urls];
    newUrls.pop();
    if (newUrls.length) {
        const newHref = newUrls.join('/').toLowerCase().replace(/ /g,"-").replace(baseUrl.toLowerCase(),'');
        if (newHref) {
            return newHref;
        }
        
    }
    return '/'
}