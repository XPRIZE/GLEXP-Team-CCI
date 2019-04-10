// Main class for all android/ios app modifications (assuming cordova)
class AppModifications {
    forceNavigationOverride() {
			
        if (window.history && window.history.pushState) {
            window.addEventListener("popstate", function (e) {
                if (this.props.forceBack) {
					let THIS = this;
                    e.preventDefault();
					pubbly.analytics.add({type: "bc"}, function () {
						window.location.href = THIS.props.forceBack;
					});
					window.setTimeout(function () {
						window.location.href = THIS.props.forceBack;
					}, 2000);
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