import * as React from "react";
import { getTopology, ISageLink, ISageNode } from "@concord-consortium/topology-tagger";

interface PartialSavedGameState {
  links: ISageLink[];
  nodes: ISageNode[];
}

interface PartialInteractiveState {
  components?: Array<{
    componentStorage?: {
      savedGameState?: PartialSavedGameState
    }
  }>;
}

export const MetricsLegendComponent = ({view}: {view: "singleAnswer" | "multipleAnswer"}) => {
  return (
    <div className={`metricsLegend ${view}`}>
      <div><span>A</span> Links</div>
      <div><span>B</span> Nodes</div>
      <div><span>C</span> Unconnected Nodes</div>
      <div><span>D</span> Collector Nodes</div>
      <div><span>E</span> Multi Link Target Nodes</div>
      <div><span>F</span> Graphs</div>
      <div><span>G</span> Linear Graphs</div>
      <div><span>H</span> Feedback Graphs</div>
      <div><span>I</span> Branched Graphs</div>
      <div><span>J</span> Multi Path Graphs</div>
    </div>
  );
};

const getSavedGameState = (interactiveState: PartialInteractiveState): PartialSavedGameState | null => {
  let result: PartialSavedGameState | null = null;

  interactiveState.components?.forEach(component => {
    if (component.componentStorage?.savedGameState) {
      result = component.componentStorage?.savedGameState;
    }
  });

  return result;
};

export const metricsReportItemHtml = (interactiveState: PartialInteractiveState) => {
  let metrics: string = "No topology metrics were found";

  const savedGameState = getSavedGameState(interactiveState);
  if (savedGameState) {
    const topology = getTopology(savedGameState);

    if (topology) {
      const {links, nodes, unconnectedNodes, collectorNodes, multiLinkTargetNodes, graphs,
             linearGraphs, feedbackGraphs, branchedGraphs, multiPathGraphs} = topology;
      metrics = `
        <div><span>A</span> ${links}</div>
        <div><span>B</span> ${nodes}</div>
        <div><span>C</span> ${unconnectedNodes}</div>
        <div><span>D</span> ${collectorNodes}</div>
        <div><span>E</span> ${multiLinkTargetNodes}</div>
        <div><span>F</span> ${graphs}</div>
        <div><span>G</span> ${linearGraphs}</div>
        <div><span>H</span> ${feedbackGraphs}</div>
        <div><span>I</span> ${branchedGraphs}</div>
        <div><span>J</span> ${multiPathGraphs}</div>
      `;
    }
  }

  return `
    <style>
      .wide > div {
        margin-right: 10px;
      }
      span {
        background-color: #f00;
        color: #fff;
        border-radius: 5px;
        padding: 3px 6px;
        margin: 2px;
      }
    </style>
    <div class="tall">
      ${metrics}
    </div>
    <div class="wide">
      ${metrics}
    </div>`;
};
