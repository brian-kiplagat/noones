// transpiled nanoid
// https://github.com/ai/nanoid
function generateUUID() {
    var t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 21;
    var e = "",
        r = (window.crypto || window.msCrypto).getRandomValues(new Uint8Array(t));

    for (; t--;) {
        var n = 63 & r[t];
        e +=
            n < 36
                ? n.toString(36)
                : n < 62
                    ? (n - 26).toString(36).toUpperCase()
                    : n < 63
                        ? "_"
                        : "-";
    }

    return e;
}

var VISITOR_ID = generateUUID();

function trackableElement(element) {
    if (!("closest" in element)) {
        return element;
    }

    const closestClickable =
        element.closest("a") || element.closest("button") || element.closest("input[type=button]");

    if (closestClickable) {
        return closestClickable;
    }

    const closestSvg = element.closest("svg");

    if (closestSvg) {
        return closestSvg.parentNode;
    }

    return element;
}

function cssPath(el) {
    if (!(el instanceof Element)) return "";
    var path = [];
    while (el.nodeType === Node.ELEMENT_NODE) {
        var selector = el.nodeName.toLowerCase();
        if (el.id) {
            selector += "#" + el.id;
            path.unshift(selector);
            break;
        } else {
            var sib = el,
                nth = 1;
            while ((sib = sib.previousElementSibling)) {
                if (sib.nodeName.toLowerCase() == selector) nth++;
            }
            if (nth != 1) selector += ":nth-of-type(" + nth + ")";
        }
        path.unshift(selector);
        el = el.parentNode;
    }
    return path.join(" > ");
}

var defaultStreamerParams = {
    app_name: "profile",
    app_type: "fe",
    visitor_id: VISITOR_ID,
    timestamp: Date.now(),
};

// Analytic to track in vanilla js. Use old ES for compatibility reason
window.analyticsService = {
    sendTrackEvent: function (dataString) {
        var url = `${window.streamerPublicUrl}/events`;

        if (navigator.sendBeacon) {
            navigator.sendBeacon(url, dataString);
        } else {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            xhr.send(dataString);
        }
    },
    track: function (params, additionalAttributes = {}) {
        var action = params.action;
        var label = params.label;
        var value = params.value;
        var custom = params.custom || {};
        var uuid = params.uuid || "";

        var data = JSON.stringify({
            ...defaultStreamerParams,
            name: action,
            attributes: {
                documentLocation:
                    document.location.origin +
                    document.location.pathname +
                    document.location.search,
                userLanguage: navigator ? (navigator.language || "").toLowerCase() : undefined,
                isPaymentMethodLocalized: custom.isPaymentMethodLocalized ? 1 : 0,
                screenColors: screen.colorDepth ? `${screen.colorDepth}-bits` : undefined,
                screenResolution: `${(window.screen || {}).width}x${(window.screen || {}).height}`,
                viewpointSize: window.visualViewport
                    ? `${(window.visualViewport || {}).width}x${(window.visualViewport || {}).height
                    }`
                    : undefined,
                documentEncoding: document.characterSet,
                documentReferrer: document.referrer,
                documentTitle: document.title,
                userAgent: navigator.userAgent,
                label: label,
                value: value || 1,
                stage: custom.stage || "",
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                uuid: uuid,
                visitCookie: window.streamerVisitCookie,
                ...additionalAttributes,
            },
        });

        this.sendTrackEvent(data);
    },
    trackPage: function () {
        var self = this;

        // not uuid in the strict sense of the word but data team said they're ok with that
        var pageId = generateUUID();
        var paramsPageView = {
            action: "PageView",
            label: window.location.pathname,
            uuid: pageId,
        };
        var paramsPageLeave = {
            action: "PageLeave",
            label: window.location.pathname,
            uuid: pageId,
        };

        window.addEventListener("beforeunload", () => {
            self.track(paramsPageLeave);
        });
        window.addEventListener("load", () => {
            self.track(paramsPageView);
        });
    },
    trackClick: function (target) {
        const text =
            target.innerText ||
            target.getAttribute("aria-label") ||
            target.getAttribute("label") ||
            target.getAttribute("title");

        this.track(
            {
                action: "element_click",
                label: "Button Clicked",
            },
            {
                element_type: target.tagName,
                element_value: text,
                element_class: target.className,
                element_text: text,
                element_css_path: cssPath(target),
            },
        );
    },
    trackWindowView: function (type, attributes = {}) {
        this.track(
            {
                action: "window_view",
                label: "Window viewed",
            },
            {
                window_type: type,
                ...attributes,
            },
        );
    },
    trackSpaPageView: function () {
        this.trackWindowView("spa_page");
    },
    trackModalView: function (target) {
        const text =
            target.getAttribute("title") || target.getAttribute("aria-label") || target.innerText;

        this.trackWindowView("modal", {
            element_css_path: cssPath(target),
            element_text: text,
        });
    },
};

window.analyticsService.trackPage();

document.addEventListener("click", (event) => {
    window.analyticsService.trackClick(trackableElement(event.target));
});

if (window.MutationObserver) {
    window.addEventListener("DOMContentLoaded", () => {
        const REACT_MODAL_SELECTOR = "div[class^='mantine-Modal-root']";

        const mantineModalsObserver = new MutationObserver((mutations) => {
            const childrenAdded = mutations.filter((mutation) => mutation.addedNodes.length > 0);

            if (childrenAdded.length === 0) {
                return;
            }

            window.analyticsService.trackModalView(mutations[0].target);
        });

        const reactElementsObserver = new MutationObserver((records) => {
            const element = records.reduce((acc, cur) => {
                if (acc || cur.type !== "childList") {
                    return acc;
                }

                const applicableNodes = [...cur.addedNodes];

                return (
                    applicableNodes.reduce(
                        (acc, node) =>
                            acc ||
                            (typeof node.querySelector === "function" &&
                                node.querySelector(REACT_MODAL_SELECTOR)),
                        null,
                    ) || acc
                );
            }, null);

            if (element) {
                mantineModalsObserver.observe(element, {
                    childList: true,
                });
            }
        });

        reactElementsObserver.observe(document.body, {
            childList: true,
            subtree: true,
        });
    });
}
