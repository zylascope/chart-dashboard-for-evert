/** chart-dashboard - https://codesandbox.io/s/chart-dashboard-1437fq - by Geoff Williams Copyright 2019-2022 THRIVE Project
 *
 * ---Description ---
 * A dashboard that uses react-chartjs-2 doughtnut chart with a custom plugin.
 *
 * --- Custom Legend Component ---
 * The custom legend draws the strikethrough text effect for items that have been
 * toggled off, by checking the boolean state of the parent state array TopicIsVisible,
 * which is passed to the legend as a prop.
 * When a legend item or swatch is clicked:
 *    -> the appropriate item is toggled in a parent state array: TopicIsVisible.
 *    -> A call to the chart object is made via the ref to toggle the chart slice.
 *
 * --- Custom Grid Component ---
 * The custom grid component displays the rows of the API data.
 * The custom grid draws rows greyed-out and draws the checkbox unchecked for items that
 * have been toggled off, by checking the boolean state of the parent state array TopicIsVisible,
 * which is passed to the Grid as a prop.
 *
 * Each row can be toggled on/off with a checkbox by toggling an item in a parent state array.
 * A call to the chart object is made via the ref to toggle the chart slice.
 *
 * --- State, Effect hook, and adapter function ---
 * When one of the dataset buttons is clicked a sample APIdata json object is placed into the apiData state
 * variable. This causes the effect hook to run my adapter function... adaptAPIData(apiData, 1).
 * The adapter function basically makes my API data to be the right shape of json that chart.js can use.
 *
 * The effect hook puts the returned data into adaptedChartData with:
 * setadaptedChartData(() => adaptAPIData(apiData, 1)
 *
 * Since the <doughnut> is passed adaptedChartData as a prop the chart should update.
 *
 * I use a state variable TopicIsVisible to store a boolean array to represent if a row is greyed out or
 * if a slice is not visible.
 *
 * ---------------- THE PROBLEM ----------------
 * The buttons "Dataset 1" and "Dataset 2" change the APIdata set, (ultimately the API data will come
 * from a call to the backend.)
 *
 * If I use redraw={true} in <doughnut>, when I click on a legend item the chart rerenders with the new chart data
 * and the plugin draws the number of visible slices in the center of the chart. The screen flickers and
 * the chart does not show slices toggling. It appears to not toggle a slice. Am I not using the apiData
 * and adaptedChartdata state and effect hooks properly?
 *
 * But with redraw={false} in <doughnut>, or omitted, the chart slices do not update with the new API data when
 * one of the buttons is clicked.
 * However: the plugin does run with the new API data because you can see that the plugin
 * draws a count of the number of rows selected in the center of the doughnut when the data API
 * state date changes. But the chart does show slices toggling.
 */

 import { React, useEffect, useRef, useState } from "react";
 import { Doughnut } from "react-chartjs-2";
 import { chartplugin, chartOptions_3_6, adaptAPIData } from "./plugin.js";
 //import custom legend code...
 import { CustomLegend } from "./CustomLegend";
 //import custom grid...
 import { Grid } from "./Grid";
 
 //import API data samples...
 import { Dataset1_APIData } from "./APIData/dataset1";
 import { Dataset2_APIData } from "./APIData/dataset2";
 
 //import { Chart, ArcElement, Tooltip, Legend } from "chart.js"; //I don't need this in my real react app but I need it here in codesandbox.io for some reason...
 //Chart.register(ArcElement, Tooltip, Legend);
 
 export default function Dashboard() {
   //API data state
   const [apiData, setApiData] = useState("");
   //Adapted API data state
   const [adaptedChartData, setadaptedChartData] = useState(
     adaptAPIData(apiData, 1)
   );
   //Adapted API data side effect
   useEffect(() => {
     setadaptedChartData(() => adaptAPIData(apiData, 1));
   }, [apiData]);
 
   //-------------Topic visibility state array---------------
   //init array to be used to init the TopicIsVisible state array...
   var ibool = [];
 
   //Initialise ibool with 60 elements, each set to true. This can also be used to reset the array
   //to all true. This will be used when new API data is loaded...
   function clearTopicVisibility() {
     for (var i = 0; i < 60; i++) {
       ibool[i] = true;
     }
   }
 
   //run the function to put true into each element of the ibool array...
   clearTopicVisibility();
 
   //create a TopicIsVisible state object and setter to update it. Init the sliceIsVisible state array
   //with the ibool array. This is used to keep track of which legend items are visible (not striked out)
   //and which grid rows have their checkboxes checked.
   //When a legend item or grid row is toggled a parent function: toggleTopicVisibility(index) is called.
   const [TopicIsVisible, setTopicVisibility] = useState(ibool);
 
   //This function will be passed to the Legend and Grid components, and will be called when a legend
   //item is clicked or a grid row is toggled. It will update the TopicIsVisible state object with the
   //newly selected legend item or grid row.
   function toggleTopicVisibility(indexToToggle) {
     var newboolArray = [];
 
     //reconstruct array including toggled element...
     TopicIsVisible.map((item, index) => {
       indexToToggle !== index
         ? (newboolArray[index] = TopicIsVisible[index])
         : (newboolArray[index] = !TopicIsVisible[index]);
     });
 
     setTopicVisibility(newboolArray);
   }
 
   const chartRef = useRef(null);
 
   function showAllTopics() {
     const chart = chartRef.current;
     for (var i = 0; i < TopicIsVisible.length; i++) {
       if (chart.getDataVisibility(i) === false) {
         toggleTopicVisibility(i);
       }
     }
     chart.update();
 
     clearTopicVisibility();
     setTopicVisibility(ibool);
   }
 
   function LoadNewDataComponent() {
     return (
       <>
         <button
           onClick={() => {
             showAllTopics();
             setApiData(Dataset1_APIData);
           }}
         >
           Dataset 1
         </button>
         <button
           onClick={() => {
             showAllTopics();
             setApiData(Dataset2_APIData);
           }}
         >
           Dataset 2
         </button>
       </>
     );
   }
 
   return (
    <>
    <Grid
        legendScreenSize="desktop"
        chartRef={chartRef}
        data={adaptedChartData}
        TopicIsVisible={TopicIsVisible}
        setTopicVisibility={setTopicVisibility}
        toggleTopicVisibility={toggleTopicVisibility}
    />
    <LoadNewDataComponent />
    <div style={{width: "400px"}}>
        <Doughnut
            redraw={false}
            data={adaptedChartData}
            options={chartOptions_3_6}
            plugins={[chartplugin]}
            ref={chartRef}
        />
    </div>
    <CustomLegend
        legendScreenSize="desktop"
        chartRef={chartRef}
        data={adaptedChartData}
        TopicIsVisible={TopicIsVisible}
        setTopicVisibility={setTopicVisibility}
        toggleTopicVisibility={toggleTopicVisibility}
    />
    </>
   );
 }
 