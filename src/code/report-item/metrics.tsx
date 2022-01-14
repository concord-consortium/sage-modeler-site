import * as React from "react";
import { getTopology, ISageLink, ISageNode } from "@concord-consortium/topology-tagger";
import { readAttachment } from "@concord-consortium/lara-interactive-api";
import { correctIconHTML, getIcon, getIconHtml, incorrectIconHTML } from "./icons";

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
  __attachment__?: string;
}

export const MetricsLegendComponent = ({view}: {view: "singleAnswer" | "multipleAnswer"}) => {
  return (
    <div className={`metricsLegend ${view}`}>
      <div>{getIcon("nodes")} Nodes</div>
      <div>{getIcon("collectorNodes")} Collectors</div>
      <div>{getIcon("linearGraphs")} Linear</div>
      <div>{getIcon("feedbackGraphs")} Feedback</div>
      <div>{getIcon("branchedGraphs")} Branched</div>
      <div>{getIcon("multiPathGraphs")} Multipath</div>
    </div>
  );
};

const getSavedGameState = async ({interactiveState, platformUserId, interactiveItemId}: {interactiveState: PartialInteractiveState, platformUserId: string, interactiveItemId: string}): Promise<PartialSavedGameState | null> => {
  let result: PartialSavedGameState | null = null;

  if (interactiveState.__attachment__) {
    const response = await readAttachment({name: interactiveState.__attachment__, interactiveId: interactiveItemId, platformUserId});
    if (response.ok) {
      interactiveState = await response.json();
    }
  }

  interactiveState?.components?.forEach(component => {
    if (component.componentStorage?.savedGameState) {
      result = component.componentStorage?.savedGameState;
    }
  });

  return result;
};

export const metricsReportItemHtml = async ({interactiveState, platformUserId, interactiveItemId}: {interactiveState: PartialInteractiveState, platformUserId: string, interactiveItemId: string}) => {
  let metrics: string = "No topology metrics were found";

  const savedGameState = await getSavedGameState({interactiveState, platformUserId, interactiveItemId});
  if (savedGameState) {
    const topology = getTopology(savedGameState);

    if (topology) {
      const {nodes, collectorNodes, linearGraphs, feedbackGraphs, branchedGraphs, multiPathGraphs} = topology;
      metrics = `
        <div>${getIconHtml("nodes")} ${nodes}</div>
        <div>${getIconHtml("collectorNodes")} ${collectorNodes}</div>
        <div>${getIconHtml("linearGraphs")} ${presentOrAbsent(linearGraphs)}</div>
        <div>${getIconHtml("feedbackGraphs")} ${presentOrAbsent(feedbackGraphs)}</div>
        <div>${getIconHtml("branchedGraphs")} ${presentOrAbsent(branchedGraphs)}</div>
        <div>${getIconHtml("multiPathGraphs")} ${presentOrAbsent(multiPathGraphs)}</div>
      `;
    }
  }

  return `
    <style>
      .tall {
        flex-direction: row;
      }
      .tall > div,
      .wide > div {
        text-align: center;
      }
      .wide > div {
        margin-right: 10px;
      }
      svg {
        padding: 3px 6px;
        margin: 2px;
      }
      .icon {
        text-align: center;
      }
      .present svg,
      .absent svg {
        width: 16px;
        padding-top: 0;
        margin-top: 0;
      }
    </style>
    <div class="tall">
      ${metrics}
    </div>
    <div class="wide">
      ${metrics}
    </div>`;
};

const presentOrAbsent = (count: number) => {
  if (count > 0) {
    return `<span class="present">${correctIconHTML}</span>`;
  }
  return `<span class="absent">${incorrectIconHTML}</span>`;
};
