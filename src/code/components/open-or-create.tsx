import * as React from "react";

interface CFMClient {
  hideBlockingModal();
  newFile();
  openFileDialog();
  showBlockingModal(options: any);
}

interface OpenOrCreateDialogProps {
  cfmClient: CFMClient;
}

class OpenOrCreateDialog extends React.Component<OpenOrCreateDialogProps, {}> {

  public static displayName = "OpenOrCreateDialog";

  private openButton: HTMLButtonElement | null;

  public componentDidMount() {
    if (this.openButton) {
      this.openButton.focus();
    }
  }

  public render() {
    return (
      <div onKeyDown={this.handleKeyDown} className="open-or-create">
        <div>
          <button onClick={this.handleOpenDocument} ref={el => this.openButton = el}>Open Document or Browse Examples</button>
        </div>
        <div>
          <button onClick={this.handleClose}>Create New Document</button>
        </div>
      </div>
    );
  }

  private handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.keyCode === 27) {
      this.handleClose();
    } else if (e.keyCode === 13) {
      this.handleOpenDocument();
    }
  }

  private handleOpenDocument = () => {
    this.handleClose();
    this.props.cfmClient.openFileDialog();
  }

  private handleClose = () => {
    this.props.cfmClient.hideBlockingModal();
  }
}

export const showOpenOrCreateDialog = (cfmClient: CFMClient) => {
  cfmClient.showBlockingModal({
    title: "What would you like to do?",
    message: <OpenOrCreateDialog cfmClient={cfmClient} />,
    onDrop: () => cfmClient.hideBlockingModal()
  });
};

