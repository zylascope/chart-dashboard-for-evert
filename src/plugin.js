var responseObj = "";

var chartData = {
  datasets: [
    {
      label: "Chart",
      backgroundColor: [],
      borderColor: "White",
      borderWidth: 1,
      borderAlign: "inner",
      hoverBorderWidth: 3,
      data: [],
      alloc: [],
      inner: [],
      outer: [],
      impact: [],
      spi: [],
      total_score: [],
      spiScore: 0,
      entity_id: "",
      entity_name: "",
      class_name: "",
      bevelWidth: 5,
      bevelHighlightColor: "rgba(256, 256, 256, 0.5)",
      bevelShadowColor: "rgba(0, 0, 0, 0.65)"
    }
  ],
  labels: [],
  topic_number: []
};

//Sample plugin (just draws a number in the center of doughnut chart)...
var chartplugin = {
  afterDatasetDraw: function drawPlugin(chart, options) {
    var ctx = chart.ctx;
    const { chartArea: area } = chart;
    var DoughnutWidth = area.right - area.left;
    var DoughnutHeight = area.bottom - area.top;
    var cx = DoughnutWidth / 2;
    var cy = DoughnutHeight / 2;

    //add the padding left and top to the dougnut center...
    cx += chartOptions_3_6.layout.padding.left;
    cy += chartOptions_3_6.layout.padding.top;

    //try to get the inner and outer radius, because if the chart data is empty
    //(when app starts, we want no chart to be drawn) then there will be no elements
    //in the data object to hold the inner and outer radius values. So we set them to zero
    //if this is the case...
    var outerRadius;
    var innerRadius;
    try {
      //get the doughnut inner and outer radius...                       (chart.outerRadius)
      outerRadius = chart._metasets[0].data[0].outerRadius;
      innerRadius =
        chart._metasets[chart._metasets.length - 1].data[0].innerRadius;
    } catch (e) {
      outerRadius = 0;
      innerRadius = 0;
    }

    /******************************************************************************************* 
      I use the boolean array sliceIsVisible[] to store which slices are visible, when a legend
      item is clicked on my function toggleTopic() toggles the boolean state of the array item.
      This way my plugin can find out which slices are currently visible. I suppose it could be 
      done some other way by looking into the chart object somehow, but I could'nt  work out how 
      to do it, so I used a global array: sliceIsVisible[] for now.

      My plugin draws things into the canvas. These parts have been removed for now. To simulate 
      my plugin doing something I have include the following loop to count how many slices are
      currenly visible and diplay the number in the center of the doughnut chart.
      */

    var number_of_rows = chartData.datasets[0].data.length;
    var countSelectedSlices = 0;
    var i;

    //Count how many slices are visible...
    for (i = 0; i < number_of_rows; i += 1) {
      if (chart.getDataVisibility(i)) {
        countSelectedSlices++;
      }
    }

    drawInnerText(countSelectedSlices);

    function drawInnerText(n) {
      var calculatedFontSize = 30 * (innerRadius / 42);

      ctx.font = "normal " + calculatedFontSize + "px Arial";
      ctx.fillStyle = "#25BDE2";
      ctx.strokeStyle = "#109DC2";
      ctx.strokeWidth = "0px"; //5px
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText(n, cx, cy);
      ctx.strokeText(n, cx, cy);
    }
  }
};

//chart options...
const chartOptions_3_6 = {
  responsive: true,
  maintainAspectRatio: true,
  hoverBorderColor: "#000",
  hoverBorderWidth: 3,
  borderColor: "White",
  borderWidth: 1,
  borderAlign: "inner",
  cutout: "40%",
  rotation: 90 /*radians, -Math.PI to Math.PI, -0.5 * Math.PI is start at top, 0 starts at right center (it is also 0 degrees), now in react it needs to be 90 degrees*/,
  /*    circumference: 2*Math.PI,  //this is the default, don't need to set it */
  plugins: {
    legend: {
      position: "bottom",
      display: false,
      maxWidth: 200
    },
    tooltip: {
      enabled: true
    }
  },
  layout: {
    padding: {
      left: 30,
      right: 30,
      top: 70,
      bottom: 70
    }
  }
};

//---------------------------------------------------------------------------------------------
//Adapter function to get the data from the JSON API response and convert it to the
//data format required by the chart.js library. And to use the different field names that
//are found in the API responses...
function adaptAPIData(APIresponseObj, s) {
  //return ({ datasets: [ {data:[] } ] });
  if (APIresponseObj === "") {
    return { datasets: [{ data: [] }] };
  }

  //set the spiScore field from the funcion parameter...
  chartData.datasets[0].spiScore = s;

  //set global variable to the API response object...
  responseObj = APIresponseObj;
  //console.log("convertResponse button clicked, adapter run from within plugin");

  //var responseObj=$("#apiResponse").val();

  //console.log("response: "+respose);

  //Get array of row ojects...
  var objArray = JSON.parse(APIresponseObj);

  var allocation = [];
  var inner = [];
  var outer = [];
  var impact = [];
  var score = [];
  var total_score = [];
  var topicName = [];
  var topicNumber = [];

  var rows = objArray.data;

  //check is data is empty and return null if it is...
  /* try
       {
       if (rows[0].data==undefined){return}
       }
       catch(e)
       {
       return null;
       } */

  //clear the data object...
  chartData.datasets[0].data = [];
  chartData.datasets[0].alloc = [];
  chartData.datasets[0].inner = [];
  chartData.datasets[0].outer = [];
  chartData.datasets[0].impact = [];
  chartData.datasets[0].spi = [];
  chartData.datasets[0].total_score = [];
  chartData.labels = [];
  chartData.datasets[0].entity_id = "";
  chartData.datasets[0].entity_name = "";
  chartData.datasets[0].backgroundColor = [];

  //Add the 3D Bevell effect to the chart data. Why the data? Why not in the config?...
  /* chartData.datasets[0].bevelWidth=5;
       chartData.datasets[0].bevelHighlightColor='rgba(256, 256, 256, 0.5)';
       chartData.datasets[0].bevelShadowColor='rgba(0, 0, 0, 0.65)'; */

  var i = 0,
    j = 0,
    k = 0;
  for (var c in rows) {
    allocation[i] = parseFloat(rows[i].allocation);
    inner[i] = parseFloat(rows[i].inner_limit);
    outer[i] = parseFloat(rows[i].outer_limit);
    impact[i] = parseFloat(rows[i].impact);

    //set the score[] to API response "score" field, if it exists...
    try {
      score[i] = parseFloat(rows[i].score);
    } catch (err) {
      score[i] = 0;
    }

    //set the total_score[] to API response "total_score" field, if it exists...
    try {
      total_score[i] = parseFloat(rows[i].total_score);
      //console.log("total_score[i]: "+total_score[i]);
    } catch (err) {
      total_score[i] = 0;
    }

    //console.log("after finally total_score[i]: "+chartData.datasets[0].total_score[i]);

    //set topicName[] to API response "topic_name" field, if it exists, else set it to "legend_id"...
    try {
      topicName[i] = rows[i].topic_name;
    } catch (err) {
      topicName[i] = rows[i].legend_id;
    }

    var topicNumTemp = rows[i].class_path_id;

    //split string into array...
    topicNumTemp = topicNumTemp.split("|");

    //show how many elements were split...
    //console.log("class_path_id has: "+topicNumTemp.length+ " elements");

    // ***** output topicNumTemp array (all the elements that were split out from rows[i].class_path_id)...
    for (j = 0; j < topicNumTemp.length; j++) {
      //console.log("topicNumTemp["+j+"]: "+topicNumTemp[j]);
    }

    //console.log("topicNumTemp[topicNumTemp.length-1]: "+topicNumTemp[topicNumTemp.length-1]);

    //set topic number as last element in array (the last thing in the string after the last pipe char | )...
    topicNumber[i] = topicNumTemp[topicNumTemp.length - 1];

    //console.log("topicNumTemp: "+topicNumTemp);

    //Set the classification name to the first element in the array ...
    chartData.datasets[0].class_name = topicNumTemp[0];

    //place the extracted data into the ciambellachartData object...
    chartData.datasets[0].data[i] = allocation[i];
    chartData.datasets[0].alloc[i] = allocation[i];
    chartData.datasets[0].inner[i] = inner[i];
    chartData.datasets[0].outer[i] = outer[i];
    chartData.datasets[0].impact[i] = impact[i];

    //set the data object spi[], if it exists, to the score[] value...
    try {
      chartData.datasets[0].spi[i] = score[i];
    } catch (err) {
      chartData.datasets[0].spi[i] = 0;
    }

    //set the data object total_score[], if it exists, to the total_score[] value...
    try {
      chartData.datasets[0].total_score[i] = total_score[i];
    } catch (err) {
      chartData.datasets[0].total_score[i] = 0;
    }

    //make tooltip labels and legend labels have classifaction id and topic name at front...
    if (
      chartData.datasets[0].class_name === "GRIS" ||
      chartData.datasets[0].class_name === "SDGS" ||
      chartData.datasets[0].class_name === "MCS"
    ) {
      chartData.labels[i] = topicNumber[i] + " - " + topicName[i];
    } else if (chartData.datasets[0].class_name === "WSSI") {
      //WSSI is slightly different...

      //init  chartData.labels[i] to be blank...
      chartData.labels[i] = "";

      //set chartData.labels[i] to be the topic number...
      for (k = topicNumTemp.length - 1; k > 0; k--) {
        chartData.labels[i] =
          chartData.labels[i] + topicNumTemp[topicNumTemp.length - k];
      }

      //add the topic name...
      chartData.labels[i] = chartData.labels[i] + " - " + topicName[i];
    }

    i++;
  }

  //get entity_id from response...
  chartData.datasets[0].entity_id = rows[0].entity_id;

  //get entity_name from response...
  chartData.datasets[0].entity_name = rows[0].entity_name;

  //Check if alloc[] is empty and if so:
  // 1. give it a fixed value for each item.
  // 2. Fill the 'data' array in the chart data object so the chart can draw slices.
  // 3. Fill the 'alloc' array in the chart data object so the chart can calculate the
  //    angles for the lines and dots for SPi values.
  // 4. Also set the background color to a gradient for each slice.
  // else
  //    Fill the backgroundColour array in the data object with colours from the classification drop down
  //    this will need to get colours from a table in the v3 system.

  //is allocation[] Nan?
  var allocIsEmpty;
  for (i = 0; i < rows.length; i++) {
    if (isNaN(allocation[i])) {
      allocIsEmpty = true;
    } else {
      allocIsEmpty = false;
      break;
    }
  }

  //console.log("allocation array is empty: " + allocIsEmpty);

  var classColours = {
    GRIS: [
      "#D0D0D0",
      "#C0C0C0",
      "#B0B0B0",
      "#8FC5FE",
      "#72B3F6",
      "#55A2EE",
      "#3990E6",
      "#1C7FDE",
      "#006ED6",
      "#C0E6B5",
      "#A4E4B5",
      "#89D2A6",
      "#6DC097",
      "#52AF87",
      "#369D78",
      "#1B8B69",
      "#007A5A",
      "#FDA1A0",
      "#F69796",
      "#F08E8D",
      "#EA8583",
      "#E47C7A",
      "#DE7370",
      "#D76967",
      "#D1605E",
      "#CB5754",
      "#C54E4B",
      "#BF4541",
      "#B93C38",
      "#B2322F",
      "#AC2925",
      "#A6201C",
      "#A01712",
      "#9A0E09",
      "#940500",
      "#840300"
    ],
    SDGS: [
      "#E5233B",
      "#DCA63A",
      "#4C9E38",
      "#C51A2D",
      "#FF3A20",
      "#25BDE2",
      "#FBC30A",
      "#A21A42",
      "#FD6824",
      "#DD1367",
      "#FD9D25",
      "#C08A30",
      "#3F7E45",
      "#3F7E45",
      "#56C02A",
      "#00689D",
      "#1A486A"
    ],
    WSSI: [
      "#213261",
      "#293E78",
      "#30498E",
      "#3855A5",
      "#4061BB",
      "#476CD2",
      "#4F78E8",
      "#D28D09",
      "#D69009",
      "#DA9209",
      "#DE950A",
      "#E2980A",
      "#E69B0A",
      "#EB9D0A",
      "#EFA00A",
      "#F3A30A",
      "#F7A60B",
      "#FBA80B",
      "#4B7834",
      "#4F7F37",
      "#53863A",
      "#588C3D",
      "#5C9340",
      "#609A43",
      "#64A146",
      "#69A748",
      "#6DAE4B",
      "#71B54E",
      "#75BC51",
      "#79C254",
      "#7EC957",
      "#82D05A",
      "#86D75D",
      "#8ADD60",
      "#8FE463",
      "#93EB66",
      "#97F269",
      "#9BF86C",
      "#C21727",
      "#C61728",
      "#CA1829",
      "#CE1829",
      "#D2192A",
      "#D6192B",
      "#DA1A2C",
      "#DE1A2D",
      "#E31B2E",
      "#E71B2E",
      "#EB1C2F",
      "#EF1C30",
      "#F31D31",
      "#F71D32",
      "#FB1E32",
      "#EB6412",
      "#EE6512",
      "#F16612",
      "#F46813",
      "#F66913",
      "#F96A13",
      "#FC6B13"
    ],
    MCS: [
      "#D6E5BD",
      "#B3EA54",
      "#86AC44",
      "#ADCBE7",
      "#79B9F5",
      "#207ED6",
      "#E7B9B8",
      "#D5817F",
      "#C24542"
    ]
  };

  if (allocIsEmpty) {
    for (i = 0; i < rows.length; i++) {
      //just a fixed amount for each element. Here I'm using 10, but it could be any positive number.
      chartData.datasets[0].data[i] = 10;
      chartData.datasets[0].alloc[i] = 10;
    }

    //also if allocIsEmpty then set the background color to a gradient...
    //chartData.datasets[0].backgroundColor = rainbowColours(rows.length); //gradient;
  } else {
    //set backgroundColour array classColours object using ChartData.datasets[0].class_name as the key...
    chartData.datasets[0].backgroundColor =
      classColours[chartData.datasets[0].class_name];
    //console.log("auto detect array... ciambellachartData.datasets[0].backgroundColor: " + ciambellachartData.datasets[0].backgroundColor);
  }
  //The adpater function (loadCiambellachartData) should return the adapted object...
  return chartData;
}

export { chartplugin, chartOptions_3_6, adaptAPIData };
