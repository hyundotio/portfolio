export const THEME_KEY = "theme";

/**
 * Runs in <head> before first paint, so a saved choice never flashes the
 * wrong colors. "system" means no data-theme attribute: CSS follows the OS.
 */
export const themeScript = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
