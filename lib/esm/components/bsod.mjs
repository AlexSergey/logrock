var _h, _div;
import { c as _c } from "react/compiler-runtime";
import { createPortal } from 'react-dom';
import { isCritical } from "../helpers/error-helpers.mjs";
import { LoggerLevels } from "../types/index.mjs";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const Bsod = props => {
  const $ = _c(20);
  const {
    actions
  } = props.stackData;
  const lastAction = actions[actions.length - 1];
  const cError = lastAction && LoggerLevels.critical in lastAction ? lastAction[LoggerLevels.critical] : undefined;
  let t0;
  let t1;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t0 = {
      background: "#00a",
      color: "#b3b3b3",
      fontFamily: "courier",
      fontSize: "14px",
      height: "100%",
      left: 0,
      position: "fixed",
      top: 0,
      width: "100%",
      zIndex: 10000
    };
    t1 = {
      height: "100%",
      position: "relative",
      width: "100%"
    };
    $[0] = t0;
    $[1] = t1;
  } else {
    t0 = $[0];
    t1 = $[1];
  }
  let t2;
  if ($[2] !== props.onClose) {
    t2 = typeof props.onClose === "function" && /*#__PURE__*/_jsx("button", {
      onClick: props.onClose,
      style: {
        background: "#eee",
        border: 0,
        cursor: "pointer",
        fontSize: "24px",
        height: "30px",
        lineHeight: "25px",
        position: "absolute",
        right: "25px",
        textAlign: "center",
        top: "25px",
        WebkitAppearance: "none",
        width: "30px",
        zIndex: 1000
      },
      type: "button",
      children: "X"
    });
    $[2] = props.onClose;
    $[3] = t2;
  } else {
    t2 = $[3];
  }
  let t3;
  if ($[4] !== cError) {
    t3 = cError && /*#__PURE__*/_jsx("h2", {
      style: {
        background: "#b3b3b3",
        color: "#00a",
        display: "inline-block",
        fontFamily: "courier",
        fontSize: "18px",
        fontWeight: "bold",
        margin: "0 auto",
        padding: "0.25em 0.5em"
      },
      children: cError.stack[0] || cError.message || ""
    });
    $[4] = cError;
    $[5] = t3;
  } else {
    t3 = $[5];
  }
  let t4;
  if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
    t4 = {
      fontSize: "1rem",
      margin: "2em",
      textAlign: "left"
    };
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  let t5;
  if ($[7] !== cError) {
    t5 = cError && Array.isArray(cError.stack) && /*#__PURE__*/_jsxs("pre", {
      style: {
        background: "none",
        border: 0,
        color: "rgb(179, 179, 179)",
        font: "10px/13px Lucida Console, Monaco, monospace",
        margin: "0 0 10px"
      },
      children: ["$", cError.stack.join("\n")]
    });
    $[7] = cError;
    $[8] = t5;
  } else {
    t5 = $[8];
  }
  let t6;
  if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
    t6 = _h || (_h = /*#__PURE__*/_jsx("h4", {
      children: "Actions:"
    }));
    $[9] = t6;
  } else {
    t6 = $[9];
  }
  let t7;
  if ($[10] !== actions || $[11] !== props.count) {
    t7 = actions.length > 0 ? /*#__PURE__*/_jsx("ol", {
      reversed: true,
      start: props.count || actions.length - 1,
      style: {
        fontSize: "13px",
        listStyle: "list-item"
      },
      children: (() => {
        const listOfActions = actions.filter(_temp).map(_temp2).filter(_temp3).reverse();
        return listOfActions.map(_temp4);
      })()
    }) : _div || (_div = /*#__PURE__*/_jsx("div", {
      children: "Nothing actions"
    }));
    $[10] = actions;
    $[11] = props.count;
    $[12] = t7;
  } else {
    t7 = $[12];
  }
  let t8;
  if ($[13] !== t5 || $[14] !== t7) {
    t8 = /*#__PURE__*/_jsxs("div", {
      style: t4,
      children: [t5, t6, t7]
    });
    $[13] = t5;
    $[14] = t7;
    $[15] = t8;
  } else {
    t8 = $[15];
  }
  let t9;
  if ($[16] !== t2 || $[17] !== t3 || $[18] !== t8) {
    t9 = /*#__PURE__*/createPortal(/*#__PURE__*/_jsx("div", {
      style: t0,
      children: /*#__PURE__*/_jsxs("div", {
        style: t1,
        children: [t2, t3, t8]
      })
    }), document.body);
    $[16] = t2;
    $[17] = t3;
    $[18] = t8;
    $[19] = t9;
  } else {
    t9 = $[19];
  }
  return t9;
};
export default Bsod;
function _temp(action) {
  if (action === null || typeof action !== "object" || Array.isArray(action)) {
    return false;
  }
  const type = Object.keys(action)[0];
  if (!type) {
    return false;
  }
  return !isCritical(type);
}
function _temp2(action_0) {
  if (action_0 === null || typeof action_0 !== "object" || Array.isArray(action_0)) {
    return null;
  }
  const type_0 = Object.keys(action_0)[0];
  if (!type_0) {
    return null;
  }
  const actionMessage = action_0[type_0];
  return {
    actionMessage,
    type: type_0
  };
}
function _temp3(x) {
  return x !== null;
}
function _temp4(t0, index) {
  const {
    actionMessage: actionMessage_0,
    type: type_1
  } = t0;
  return /*#__PURE__*/_jsx("li", {
    children: /*#__PURE__*/_jsx("p", {
      children: /*#__PURE__*/_jsxs("strong", {
        children: [type_1, ": ", actionMessage_0]
      })
    })
  }, index);
}