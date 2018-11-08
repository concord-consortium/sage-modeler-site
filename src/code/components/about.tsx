import * as React from "react";

interface AboutProps {
  onClose: () => void;
}

interface AboutState {
  version: string;
  year: string;
}

export class About extends React.Component<AboutProps, AboutState> {

  public static displayName = "About";

  public state: AboutState = {
    year: "",
    version: ""
  };

  public componentWillMount() {
    const element = document.querySelector('meta[name="build-info"]');
    const content = (element && element.getAttribute("content")) || "";
    const [date, version, ...rest] = content.split(" ");
    const [year, ...rest2] = date.split("-");
    this.setState({year, version});
  }

  public render() {
    return (
      <div className="about" onClick={this.handleClose}>
        <div className="content" onClick={this.handleIgnore}>
          <div className="top" style={{textAlign: "right"}}>
            <i className="icon-codap-ex" style={{padding: 0, cursor: "pointer"}} onClick={this.handleClose} />
          </div>
          <div className="inner" style={{paddingTop: 0, textAlign: "center"}}>
            <h2>SageModeler</h2>
            <p>Version {this.state.version}</p>
            <p>
              {`Copyright © ${this.state.year} The Concord Consortium. All rights reserved.`}
            </p>
            <p>
              This open-source software is licensed under the <a href="https://github.com/concord-consortium/building-models/blob/master/LICENSE" target="_blank">MIT license</a>.
            </p>
            <p>
              Please provide attribution to The Concord Consortium
              <br />
              and the URL <a href="https://concord.org/" target="_blank">https://concord.org</a>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  private handleClose = () => {
    this.props.onClose();
  }

  private handleIgnore = (e) => {
    e.stopPropagation();
  }
}
