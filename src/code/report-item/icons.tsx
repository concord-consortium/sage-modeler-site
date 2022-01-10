import * as React from "react";
import * as ReactDOMServer from "react-dom/server";

const BranchedIcon = <svg height="37" viewBox="0 0 39 37" width="39" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><rect fill="#d8d8d8" height="25" rx="4" stroke="#626262" width="29" x="4.5" y=".5"/><g fill="#555"><circle cx="10" cy="13" r="4"/><circle cx="28" cy="20" r="4"/><circle cx="28" cy="6" r="4"/></g><g transform="translate(10 3.466153)"><path d="m11.375 2.15884724 4 5h-8z" fill="#555" transform="matrix(.39073113 .92050485 -.92050485 .39073113 11.218925 -7.632252)"/><path d="m0 9.533847 10-4" stroke="#555" strokeLinecap="square" strokeWidth="2"/></g><g transform="matrix(1 0 0 -1 10 22.999999)"><path d="m11.375 2.15884724 4 5h-8z" fill="#555" transform="matrix(.39073113 .92050485 -.92050485 .39073113 11.218925 -7.632252)"/><path d="m0 9.533847 10-4" stroke="#555" strokeLinecap="square" strokeWidth="2"/></g><text fill="#555" fontFamily="Helvetica" fontSize="9"><tspan x=".236572" y="35">Branched</tspan></text></g></svg>;
const CollectorIcon = <svg height="37" viewBox="0 0 41 37" width="41" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><rect fill="#d8d8d8" height="25" rx="4" stroke="#626262" width="29" x="6.5" y=".5"/><g fill="#555"><circle cx="22" cy="11" r="4"/><circle cx="13" cy="7" r="4"/><circle cx="29" cy="6" r="4"/><circle cx="30" cy="18" r="4"/><circle cx="12" cy="16" r="4"/><circle cx="20" cy="20" r="4"/><text fontFamily="Helvetica" fontSize="9"><tspan x=".493896" y="35">Collectors</tspan></text></g></g></svg>;
const FeedbackIcon = <svg height="37" viewBox="0 0 41 37" width="41" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><rect fill="#d8d8d8" height="25" rx="4" stroke="#626262" width="29" x="5.5" y=".5"/><g fill="#555"><circle cx="11" cy="18" r="4"/><circle cx="29" cy="18" r="4"/><path d="m22.375 15.625 4 5h-8z" transform="matrix(0 1 -1 0 40.5 -4.25)"/><path d="m12.375 8.625 4 5h-8z" transform="matrix(-.95630476 -.2923717 .2923717 -.95630476 20.956636 25.38199)"/></g><path d="m15 18h5" stroke="#555" strokeLinecap="square" strokeWidth="2"/><path d="m29 18c-.9166667-9.59012229-3.9166667-14.38518343-9-14.38518343-3.922246-.03663471-6.2900491 2.1614546-7.1034091 6.59426793" stroke="#555" strokeWidth="2"/><text fill="#555" fontFamily="Helvetica" fontSize="9"><tspan x=".737793" y="35">Feedback</tspan></text></g></svg>;
const LinearIcon = <svg height="37" viewBox="0 0 30 37" width="30" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><rect fill="#d8d8d8" height="25" rx="4" stroke="#626262" width="29" x=".5" y=".5"/><g fill="#555"><circle cx="6" cy="13" r="4"/><circle cx="24" cy="13" r="4"/><path d="m17.375 10.625 4 5h-8z" transform="matrix(0 1 -1 0 30.5 -4.25)"/></g><path d="m10 13h5" stroke="#555" strokeLinecap="square" strokeWidth="2"/><text fill="#555" fontFamily="Helvetica" fontSize="9"><tspan x="1.990967" y="35">Linear</tspan></text></g></svg>;
const MultiPathIcon = <svg height="37" viewBox="0 0 37 37" width="37" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><rect fill="#d8d8d8" height="25" rx="4" stroke="#626262" width="29" x="4.5" y=".5"/><g fill="#555"><circle cx="10" cy="18" r="4"/><circle cx="28" cy="18" r="4"/><circle cx="19" cy="6" r="4"/><path d="m21.375 15.625 4 5h-8z" transform="matrix(0 1 -1 0 39.5 -3.25)"/><path d="m8.68818313 5.04854531 3.99999997 4.99999999h-7.99999997z" transform="matrix(.9781476 -.20791169 -.20791169 -.9781476 20.514956 20.610214)"/></g><path d="m4.07738945 8.14499184c3.31320709-4.66619887 3.12049429-7.86164868-.5781384-9.58634942" stroke="#555" strokeWidth="2" transform="matrix(.42261826 -.90630779 -.90630779 -.42261826 24.65869 13.137592)"/><path d="m8.68818313 5.04854531 3.99999997 4.99999999h-7.99999997z" fill="#555" transform="matrix(-.49999999549 -.86602540787 -.86602540787 .49999999549 23.57094113934 11.35065339074)"/><path d="m4.07738945 8.14499184c3.31320709-4.66619887 3.12049429-7.86164868-.5781384-9.58634942" stroke="#555" strokeWidth="2" transform="matrix(-.99254615543 -.12186934636 -.12186934636 .99254615543 15.1835710567 9.71889531074)"/><path d="m14 18h5" stroke="#555" strokeLinecap="square" strokeWidth="2"/><text fill="#555" fontFamily="Helvetica" fontSize="9"><tspan x="0" y="35">Multipath</tspan></text></g></svg>;
const NodeIcon = <svg height="37" viewBox="0 0 30 37" width="30" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><rect fill="#d8d8d8" height="25" rx="4" stroke="#626262" width="29" x=".5" y=".5"/><g fill="#555"><circle cx="15" cy="13" r="4"/><text fontFamily="Helvetica" fontSize="9"><tspan x="1.492188" y="35">Nodes</tspan></text></g></g></svg>;

type IconType = "nodes" | "collectorNodes" | "linearGraphs" | "feedbackGraphs" | "branchedGraphs" | "multiPathGraphs";

const icons: Record<IconType, JSX.Element> = {
  nodes: NodeIcon,
  collectorNodes: CollectorIcon,
  linearGraphs: LinearIcon,
  feedbackGraphs: FeedbackIcon,
  branchedGraphs: BranchedIcon,
  multiPathGraphs: MultiPathIcon,
};

export const getIcon = (type: IconType) => {
  return <div className="icon">{icons[type]}</div>;
};

export const getIconHtml = (type: IconType) => {
  return ReactDOMServer.renderToStaticMarkup(getIcon(type));
};

