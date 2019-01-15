function messyHTML(which) {
    // Return long ugly HTML string for echoing
    switch (which) {
        case "killDraft":
            return "<div class=fatal><p>Page couldn't load</p><p>Check console for error log</p></div>";
            break;
        case "killPublication":
            return "";
            break;
        case "newEngineUpdate":
            return "<div id=fatal><h2>Warning</h2><p>This book was created for the old pubbly engine and needs to be manually updated. Please follow <a href='../update.php?bookID=" + window.bookID + "'>this link</a>. Allow the script to fully execute; You will return to this draft once finished.</p></div>"
        case "nav":
            return `<img class="previous" />
                <select class=goto>
                </select>
                </div>
                <img class="next" />`;
            break;
        case "fatalProductionError":
            return `
        <style>
            body {
            }
            .errCover {
                position:absolute;
                height:480px;
                width:480px;
                top:calc(50% - 240px);
                left:calc(50% - 240px);
                border-radius:35px;
                cursor:pointer;
                transition:0.2s;
            }
            .errCover .rabbitHole {
                position:absolute;
                height:100%;
                width:100%;
                transition:0.3s;
            }
        </style>
        <a href="index.php">
            <div class="errCover">
                <video class="rabbitHole normal" autoplay="true">
                    <source src="${window.engineLoc}/../shared/error/rabbit_hole_normal.webm"  type="video/webm">
                </video>
            </div>
        </a>`;
            break;
        default:
            return "";
            break;
    }
}
