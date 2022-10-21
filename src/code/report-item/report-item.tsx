import * as React from "react";
import { useEffect, useState } from "react";
import * as semver from "semver";
import { IReportItemInitInteractive,
         addGetReportItemAnswerListener,
         sendReportItemAnswer,
         getClient,
         IReportItemAnswerItem} from "@concord-consortium/lara-interactive-api";
import { MetricsLegendComponent, metricsReportItemHtml } from "./metrics";

interface Props {
  initMessage: IReportItemInitInteractive;
}

export const ReportItemComponent: React.FC<Props> = (props) => {
  const {initMessage} = props;
  const {view, interactiveItemId} = initMessage;
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    if (initMessage && initMessage.mode === "reportItem") {
      const {interactiveItemId} = initMessage;

      addGetReportItemAnswerListener(async (request) => {
        // TODO: update lara interactive api to change addGetReportItemAnswerListener to a generic with <IInteractiveState, IAuthoredState>
        // and remove the `any` after request
        const { platformUserId, interactiveState, authoredState, version } = request as any;

        if (!version) {
          // for hosts sending older, unversioned requests
          console.error("Missing version in getReportItemAnswer request.");
        } else if (semver.satisfies(version, "2.x")) {
          const html = await metricsReportItemHtml({interactiveState, platformUserId, interactiveItemId});
          const items: IReportItemAnswerItem[] = [
            {
              type: "links"
            },
            {
              type: "html",
              html
            },
          ];
          sendReportItemAnswer({version, platformUserId, items, itemsType: "fullAnswer"});
        } else {
          console.error("Unsupported version in getReportItemAnswer request:", version);
        }
      });
      getClient().post("reportItemClientReady");
    }
  }, [initMessage]);

  // do not render anything if hidden
  if (view === "hidden") {
    return null;
  }

  return (
    <div className={`reportItem ${view}`}>
      <MetricsLegendComponent view={view} />
    </div>
  );
};
