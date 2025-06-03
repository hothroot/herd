
const isDev = import.meta.env.DEV;
const isStaging = import.meta.env.STAGING;

export default function DevBanner() {
    if (isStaging) {
        return (
            <div id="butterbar">
                This site is under development, please visit&nbsp;
                <a href="https://herdonthehill.org/">the real site</a> instead. 
            </div>
        );
    } else if (isDev) {
        return (
            <div id="bloodbar">
                Dev Site
            </div>
        );
    }
}
