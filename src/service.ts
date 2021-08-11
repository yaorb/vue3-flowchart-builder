import * as Dialogs from "@jsplumbtoolkit/dialogs"
import { Node, ObjectData, JsPlumbToolkit, Edge, uuid } from "@jsplumbtoolkit/core"

const dialogs = Dialogs.newInstance({
    dialogs: {
        "dlgText":[
            '<input type="text" size="50" jtk-focus jtk-att="text" value="${text}" jtk-commit="true"/>',
            'Enter Text',
            true

        ],
        "dlgConfirm":[
            '${msg}',
            'Please Confirm',
            true
        ],
        "dlgMessage":[
            '${msg}',
            "Message",
            false
        ]
    }
})

function showEdgeEditDialog(data:ObjectData, continueFunction:Dialogs.CommitFunction, abortFunction:Dialogs.CancelFunction) {
    dialogs.show({
        id: "dlgText",
        data: {
            text: data.label || ""
        },
        onOK: function (data) {
            continueFunction({label:data.text || ""})
        },
        onCancel:abortFunction
    });
}

export default {

    nodeFactory: (type: string, data: any, callback: Dialogs.CommitFunction, abort?: Dialogs.CancelFunction) => {
        dialogs.show({
            id: 'dlgText',
            title: 'Enter ' + type + ' name:',
            onOK: (d: any) => {
                data.text = d.text;
                // if the user entered a name...
                if (data.text) {
                    // and it was at least 2 chars
                    if (data.text.length >= 2) {
                        // set an id and continue.
                        data.id = uuid()
                        callback(data);
                    } else {
                        // else advise the user.
                        alert(type + ' names must be at least 2 characters!');
                    }
                }
                // else...do not proceed.
            }
        });
    },

    editNode:(node:Node, commitFunction:Dialogs.CommitFunction) => {
        dialogs.show({
            id: "dlgText",
            data: node.data,
            title: "Edit " + node.data.type + " name",
            onOK: commitFunction
        });
    },
    editEdge:(data:ObjectData, continueCallback:Dialogs.CommitFunction, abortCallback:Dialogs.CancelFunction) => {
        showEdgeEditDialog(data, continueCallback, abortCallback)
    },
    maybeDelete:(n:Node, toolkit:JsPlumbToolkit) => {
        dialogs.show({
            id:"dlgConfirm",
            data:{
                msg:`Delete ${n.data.text}?`
            },
            onOK:() => toolkit.removeNode(n)
        })
    },
    confirmDeleteEdge:(e:Edge, confirm:Dialogs.CommitFunction) => {
        dialogs.show({
            id: "dlgConfirm",
            data: {
                msg: "Delete Edge"
            },
            onOK: confirm
        });
    }
}
