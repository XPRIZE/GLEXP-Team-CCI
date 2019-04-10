/*
 * So a good way to keep sanity between deployable environments and languages is to echo pvariable properties or runtime switches into the HTML file that runs everything. As an example...
 *
 * new Pubbly({startPage: {START_PAGE}});
 * {START_PAGE} being replaced with a 0 or whatever.
 *
 * HOWEVER, I can't garuntee that all replaced thing will be replaced... some may stay in their untouched state, and gum up the works. So new function, and library for future functions... A find and replace cleanup process, for any constructor classes that may be taking some find and replace props
 */

function stripNoReplaceProps(props) {
    let dirty = [];
    let clean = {};
    for (let name in props) {
        if (typeof props[name] === "string") {
            let str = props[name].toString();
            if (str.charAt() === "{" && str.charAt(str.length - 1) === "}") {
                if (str.length < 100) {
                    clean[name] = props[name];
                }   else    {
                    dirty.push(name);
                }
            }   else    {
                    clean[name] = props[name];
            }
        }   else    {
            clean[name] = props[name];
        }
    }
    if (dirty.length) {
        console.warn("Some of the to be found and replace runtime props were NOT replaced. They have been stripped for convienence, but in the future, please clean up your HTML. Dawg.");
        console.warn("Bad props: " + dirty.join(" -- "));
    }
    return clean;
}
