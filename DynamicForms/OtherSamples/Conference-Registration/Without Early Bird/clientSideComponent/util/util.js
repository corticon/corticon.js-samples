// Assumption: jquery has been included and is defined.
// Add a corticon "namespace" under window object and a namespace function to define our own sub-namespace
(function() {
    if ( window.corticon === undefined )
        window.corticon = {};

    // Define the util namespace for all utility functions.
    if ( window.corticon.util === undefined )
        window.corticon.util = {};
    else
        throw "window.corticon.util should not be used by another jquery plugin";

    // if ( $.corticon === undefined )
    //     $.corticon = {};
    //
    // // Define the util namespace for all utility functions.
    // if ( $.corticon.util === undefined )
    //     $.corticon.util = {};
    // else
    //     throw "jquery.corticon.util should not be used by another jquery plugin";
    //
    /**
     * usage: jQuery.corticon.util.namespace( corticon.xyz );
     * or $.corticon.util.namespace( corticon.xyz );
     * Multiple namespaces can be defined in one call: or $.corticon.util.namespace( corticon.xyz corticon.abc );
     */
    window.corticon.util.namespace = function() {
        /* inspired by http://stackoverflow.com/questions/527089/is-it-possible-to-create-a-namespace-in-jquery */
        var a=arguments, o=null, i, j, d;
        for (i = 0; i < a.length; i = i + 1) {
            d = a[i].split(".");
            o = window;
            for (j = 0; j < d.length; j = j + 1) {
                o[d[j]] = o[d[j]] || {};
                o = o[d[j]];
            }
        }

        // console.log( JSON.stringify(window.corticon) );
    };

    window.corticon.util.copyToClipboard = function (selector) {
        const text = $(selector).val();
        // navigator.permissions.query({name: "clipboard-write"}).then(result => {
        //     if (result.state == "granted" || result.state == "prompt") {
        //         /* write to the clipboard now */
        //         console.log("should work now");
        //         navigator.clipboard.writeText(text).then(function(result) {
        //             /* clipboard successfully set */
        //         }, function(result) {
        //             console.log("Still Could not copy to clipboard - probably no privs to do that in this browser !"+result);
        //         });
        //     }
        // });

        navigator.clipboard.writeText(text).then(function(result) {
            /* clipboard successfully set */
        }, function(result) {
            console.log("Could not copy to clipboard - probably no privs to do that in this browser !"+result);
        });
    }
})();

