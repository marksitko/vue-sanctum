export const currentWildcardDomain = () => window.location.hostname.substr(window.location.hostname.indexOf('.'));
export const setCookie = (name, value, days) => {
    const d = new Date();
    const domain = currentWildcardDomain();
    d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
    document.cookie = `${name}=${value};domain=${domain};path=/;expires=${d.toGMTString()}`;
};
export const hasCookie = name => document.cookie.indexOf(name) !== -1;
export const deleteCookie = name => {
    setCookie(name, '', -1);
};
