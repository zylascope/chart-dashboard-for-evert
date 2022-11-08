//import { Legend } from "chart.js";
import React from "react";

/*********************************************************************************
 * The main reason for making a custom legend is because our charts will have many slices
 * in some cases more than 30 and the legend will make the chart squash up until it is
 * no longer visible. I want the chart and the legend to display in two seperate MUI
 * grid containers. So I have one component for DougnutChart and another for CustomLegendTable
 * in the project. When the user clicks on the custom legend it applies the strike out effect
 * to the legend item, it toggles the visibility of the slice, it needs to toggle the boolean
 * state of the slice in the chart. This component also does the presets as it has DOM access
 * to the legend items to do strikethrough effect and also have access to the chartRef.
 *
 * This will now be doene as folows
 * - The legend will render based on state variable 'data'
 * - Legend items will appear striked out if the slice is not visible
 * - The legend will have a swatch button to toggle the visibility of the slice - also clicking on
 *  the topic text will toggle it - the passed-down function toggleTopicVisibility(i) will be called
 *  to toggle the parent state var: sliceIsVisible[]
 *
 */
function CustomLegend({
  chartRef,
  data,
  legendScreenSize,
  TopicIsVisible,
  toggleTopicVisibility
}) {
  //check if data is empty and return null if it is
  try {
    if (data.datasets[0].data === "") {
      return null;
    }
  } catch (e) {
    return null;
  }

  var legendRowHeight;
  var legendSwatchHeight;
  var legendPaddingBottom;
  var legendVerticalAlign;

  if (document.documentElement.clientWidth < 900) {
    legendScreenSize = "mobile";
  } else {
    legendScreenSize = "desktop";
  }

  //size the swatch and legend item heights for large screens...
  if (legendScreenSize === "desktop") {
    legendRowHeight = 13;
    legendSwatchHeight = 13;
    legendPaddingBottom = 10;
    legendVerticalAlign = 0;
  }

  //size the swatch and legend item heights for small screens...
  if (legendScreenSize === "mobile") {
    legendRowHeight = 23;
    legendSwatchHeight = 40; //43; //30;
    legendPaddingBottom = 25; //15;
    legendVerticalAlign = 13; //14;
  }

  function toggleCustomLegendItem(index) {
    //here it should send a click to the default legend.
    const chart = chartRef.current;
    if (chart) {
      console.log("Toggling item: " + index);
      chart.toggleDataVisibility(index);
      //chart.update();
    }
    toggleTopicVisibility(index);
  }

  const strike = {
    textDecoration: "line-through",

    border: "0px solid orange",
    paddingLeft: 0 + "px",
    fontFamily: "Lucida Console",
    fontSize: 14 + "px",
    color: "#000",
    fontWeight: "1000",
    verticalAlign: legendVerticalAlign + "px",
    lineHeight: 0 + "px",
    overflow: "hidden"
  };

  const noStrike = {
    textDecoration: "none",

    border: "0px solid orange",
    paddingLeft: 0 + "px",
    fontFamily: "Lucida Console",
    fontSize: 14 + "px",
    color: "#000",
    fontWeight: "1000",
    verticalAlign: legendVerticalAlign + "px",
    lineHeight: 0 + "px",
    overflow: "hidden"
  };

  return (
    <>
      <table style={{ border: "0px solid red", paddingInlineStart: "0px" }}>
        {data.datasets[0].data.map((item, i) => (
          <tr
            key={i.toString()}
            style={{
              border: "0px solid green",
              height: legendRowHeight + "px",
              listStyleType: "none",
              marginBottom: legendPaddingBottom + "px"
            }}
          >
            <td>
              <button
                onClick={(event) => toggleCustomLegendItem(i)}
                style={{
                  border: "0px solid blue",
                  background: data.datasets[0].backgroundColor[i],
                  width: 43 + "px",
                  height: legendSwatchHeight + "px",
                  marginBottom: 0 + "px"
                }}
              />
            </td>
            <td>&nbsp;</td>
            <td>
              <span
                id={"label" + i}
                onClick={(event) => toggleCustomLegendItem(i)}
                style={TopicIsVisible[i] === true ? noStrike : strike}
              >
                {data.labels[i]}
              </span>
            </td>
          </tr>
        ))}
        <tbody></tbody>
      </table>
    </>
  );
}

export { CustomLegend };
