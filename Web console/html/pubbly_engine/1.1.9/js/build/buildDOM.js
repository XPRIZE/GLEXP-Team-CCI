function buildDOM() {
    const _buildDOM = this;

    this.dom = $("#pubbly_main").append(`
    <div id='preflight_cont' style='height:500px;width:500px;'>
        <div style='height:500px;width:500px;position:absolute;'>
            <div id='preflight_load_cont' class='loader'>
            </div>
        </div>
    </div>
    `);
    this.progress = new ProgressGraph("vertical_letters", $("#preflight_load_cont"));
    this.progress.say("Starting checks");

    this.kill = function() {
        $("#preflight_cont").remove();
    }

}
