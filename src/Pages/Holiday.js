import React from "react";
import HolidaysCalendar from "./HolidaysCalendar.jsx";

/**
 * HolidayList (Employee / Read-Only View)
 * This reuses the beautiful HolidaysCalendar layout but passes `isEmployeeView={true}`
 * which automatically hides the "Add Holiday" button, the calendar click interactions,
 * and the Edit/Delete actions in the table!
 */
const HolidayList = () => {
  return <HolidaysCalendar isEmployeeView={true} />;
};

export default HolidayList;
