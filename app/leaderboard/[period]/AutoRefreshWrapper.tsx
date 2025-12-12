"use client";

import dynamic from "next/dynamic";

const AutoRefresh = dynamic(() => import("./AutoRefresh"), { ssr: false });

export default AutoRefresh;
