import { Tab } from "@headlessui/react";

function CustomTab({ children }: any) {
    return (
        <Tab className="ui-selected:bg-prosperity border-r-black border-r  p-2">
            {children}
        </Tab>
    );
}

export default CustomTab;
