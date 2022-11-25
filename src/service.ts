import * as Dialogs from "@jsplumbtoolkit/dialogs";
import { Node, ObjectData, JsPlumbToolkit, Edge, uuid } from "@jsplumbtoolkit/core";

const dialogs = Dialogs.newInstance({
  dialogs: {
    dlgText: {
      template: '<input type="text" size="50" jtk-focus jtk-att="text" value="${text}" jtk-commit="true"/>',
      title: "Enter Text",
      cancelable: true,
    },
    dlgConfirm: {
      template: "${msg}",
      title: "Please Confirm",
      cancelable: true,
    },
    dlgMessage: {
      template: "${msg}",
      title: "Message",
      cancelable: false,
    },
  },
});

function showEdgeEditDialog(
  data: ObjectData,
  continueFunction: Dialogs.CommitFunction,
  abortFunction: Dialogs.CancelFunction,
) {
  dialogs.show({
    id: "dlgText",
    data: {
      text: data.label || "",
    },
    onOK: function (data) {
      continueFunction({ label: data.text || "" });
    },
    onCancel: abortFunction,
  });
}

/**
 * This object provides a few helper methods for other parts of the app, and is injected into the `BaseEditableNode` component, as well as `Flowchart`,
 * the main component. `inject/provide` is a new capability that Vue 3 offers which Vue 2 does not have.
 */
export default {
  nodeFactory: (
    type: string,
    data: ObjectData,
    callback: Dialogs.CommitFunction,
    abort?: Dialogs.CancelFunction,
  ): void => {
    dialogs.show({
      id: "dlgText",
      title: "Enter " + type + " name:",
      onOK: (d: Record<string, any>) => {
        data.text = d.text;
        // if the user entered a name...
        if (data.text) {
          // and it was at least 2 chars
          if (data.text.length >= 2) {
            // set an id and continue.
            data.id = uuid();
            callback(data);
          } else {
            // else advise the user.
            alert(type + " names must be at least 2 characters!");
          }
        }
        // else...do not proceed.
      },
    });
  },

  editNode: (node: Node, commitFunction: Dialogs.CommitFunction): void => {
    dialogs.show({
      id: "dlgText",
      data: node.data,
      title: `Edit ${node.data.type} name`,
      onOK: commitFunction,
    });
  },
  editEdge: (
    data: ObjectData,
    continueCallback: Dialogs.CommitFunction,
    abortCallback: Dialogs.CancelFunction,
  ): void => {
    showEdgeEditDialog(data, continueCallback, abortCallback);
  },
  maybeDelete: (n: Node, toolkit: JsPlumbToolkit): void => {
    dialogs.show({
      id: "dlgConfirm",
      data: {
        msg: `Delete ${n.data.text}?`,
      },
      onOK: () => toolkit.removeNode(n),
    });
  },
  confirmDeleteEdge: (e: Edge, confirm: Dialogs.CommitFunction): void => {
    dialogs.show({
      id: "dlgConfirm",
      data: {
        msg: "Delete Edge?",
      },
      onOK: confirm,
    });
  },
};
