import * as React from "react";
import { IReportItemInitInteractive } from "@concord-consortium/lara-interactive-api";
import { InitMessageInfoComponent } from "./init-message-info";

interface Props {
  initMessage: IReportItemInitInteractive;
}

export const MultipleAnswerSummaryComponent: React.FC<Props> = (props) => {
  return (
    <div>
      <strong>Multiple Answer Summary</strong>
      <InitMessageInfoComponent initMessage={props.initMessage} />
    </div>
  );
};
