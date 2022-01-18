import * as React from "react";
import { useEffect, useState } from "react";
import { IReportItemInitInteractive,
         addGetReportItemAnswerListener,
         sendReportItemAnswer,
         getClient } from "@concord-consortium/lara-interactive-api";
import { MetricsLegendComponent, metricsReportItemHtml } from "./metrics";

interface Props {
  initMessage: IReportItemInitInteractive;
}

export const ReportItemComponent: React.FC<Props> = (props) => {
  const {initMessage} = props;
  const {view, interactiveItemId} = initMessage;
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    addGetReportItemAnswerListener(async (request) => {
      const {type, platformUserId, interactiveState, authoredState} = request;

      setUserAnswers(prev => ({...prev, [platformUserId]: interactiveState}));

      switch (type) {
        case "html":
          const html = await metricsReportItemHtml({interactiveState, platformUserId, interactiveItemId});
          sendReportItemAnswer({type: "html", platformUserId, html});
          break;
      }
    });

    // tell the portal-report we are ready for messages
    getClient().post("reportItemClientReady");
  }, []);

  return (
    <div className={`reportItem ${view}`}>
      <MetricsLegendComponent view={view} />
    </div>
  );
};
