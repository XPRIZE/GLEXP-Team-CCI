// Main class for all android/ios app modifications (assuming cordova)
class AppModifications {
    forceNavigationOverride() {
        if (window.history && window.history.pushState) {
            window.addEventListener("popstate", function (e) {
                if (this.props.forceBack) {
                    e.preventDefault();
                    window.location.href = this.props.forceBack;
                }   else {
                    // Warning of data loss?
                }
            }.bind(this));
        }
    }
    constructor(props) {
        this.props = Object.assign({
            forceBack: false,
        }, props);
        this.forceNavigationOverride();
    }
}