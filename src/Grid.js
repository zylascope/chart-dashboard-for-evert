import React from "react";
//import {toggleTopic, drawTable} from './ciambella-chart-plugin-with-adapterjs'; //don't import ciambellaChartData

function Grid({
  chartRef,
  data,
  TopicIsVisible,
  setTopicVisibility,
  toggleTopicVisibility
}) {
  //return null (do not render Grid) if data is empty...
  try {
    if (data.datasets[0].data === "") {
      return null;
    }
  } catch (e) {
    return null;
  }

  function toggleGridItem(index) {
    //here it should send a click to the default legend.
    const chart = chartRef.current;
    if (chart) {
      console.log("Toggling item: " + index);
      chart.toggleDataVisibility(index);
      //chart.update();
    }
    toggleTopicVisibility(index);
  }

  const whiteRow = {
    border: "1px solid black",
    fontSize: "14px",
    backgroundColor: "#fff"
  };

  const greyRow = {
    border: "1px solid black",
    fontSize: "14px",
    backgroundColor: "#e0e0e0"
  };

  return (
    <table
      style={{
        border: "1px solid black",
        borderCollapse: "collapse",
        padding: "0px"
      }}
    >
      <thead>
        <tr
          style={{
            border: "1px solid black",
            width: "100%",
            height: "40px",
            fontSize: "14px",
            color: "#fff",
            background: "#1976d2"
          }}
        >
          <td style={{ border: "1px solid black", textAlign: "center" }}>
            <input type="checkbox" name="selectAll" defaultChecked />
          </td>

          <td style={{ border: "1px solid black", textAlign: "center" }}>
            Topic
          </td>
          <td style={{ border: "1px solid black", textAlign: "center" }}>A</td>
          <td style={{ border: "1px solid black", textAlign: "center" }}>B</td>
          <td style={{ border: "1px solid black", textAlign: "center" }}>C</td>
        </tr>
      </thead>

      {data.datasets[0].data.map((item, i) => (
        <>
          <tbody>
            <tr key={i} style={TopicIsVisible[i] === true ? whiteRow : greyRow}>
              {/* How can I change the visibility of the checkbox check state based on. try using checked={true or false}  */}
              <td style={{ border: "1px solid black", textAlign: "center" }}>
                {/* TopicIsVisible[i].toString() */}
                <input
                  type="checkbox"
                  checked={TopicIsVisible[i] === true ? "true" : ""}
                  onClick={() => {
                    toggleGridItem(i);
                  }}
                />
              </td>

              <td style={{ border: "1px solid black", textAlign: "left" }}>
                {data.labels[i]}
              </td>
              <td style={{ border: "1px solid black", textAlign: "right" }}>
                {data.datasets[0].alloc[i]}
              </td>
              <td style={{ border: "1px solid black", textAlign: "right" }}>
                {data.datasets[0].inner[i]}
              </td>
              <td style={{ border: "1px solid black", textAlign: "right" }}>
                {data.datasets[0].outer[i]}
              </td>
            </tr>
          </tbody>
        </>
      ))}
    </table>
  );
}

export { Grid };
