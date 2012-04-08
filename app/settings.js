/*
 * Global app settings
 */
(function(gv) {
    
    // map styles
    var novisibility = [{ visibility: "off" }],
        mapStyle = [
            {
                elementType: "labels",
                stylers: novisibility
            },{
                featureType: "administrative",
                elementType: "geometry",
                stylers: novisibility
            },{
                featureType: "road",
                elementType: "geometry",
                stylers: novisibility
            },{
                featureType: "transit",
                elementType: "geometry",
                stylers: novisibility
            },{
                featureType: "poi",
                elementType: "geometry",
                stylers: novisibility
            },{
                featureType: "water",
                stylers: [
                    { hue: "#0033ff" },
                    { saturation: 82 },
                    { lightness: 95 }
                ]
            },{
                featureType: "landscape",
                stylers: [
                    { hue: "#80ff00" },
                    { saturation: 15 },
                    { lightness: -20 }
                ]
            }
        ],
        // colors for frequency scale
        scaleColors = ["090066", "6b0051", "ce003c", "cc0020", "ee0000"],
        colorThemes = scaleColors.map(function(color) {
            return TimeMapTheme.createCircleTheme({ color: color })
        });
        
    // add settings to namespace
    _.extend(gv.settings, {
        // google maps style settings
        mapStyle: mapStyle,
        scaleColors: scaleColors,
        colorThemes: colorThemes,
        
        // number of related places to show
        relatedCount: 8
    });
    
})(gv);