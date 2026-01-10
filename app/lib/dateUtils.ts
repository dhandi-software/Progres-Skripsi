/**
 * Format current date to display format
 * @returns Object with dayName and formattedDate
 * Example: { dayName: "Saturday", formattedDate: "7 December 2024" }
 */
export function getCurrentDate(): { dayName: string; formattedDate: string } {
    const now = new Date();
    
    const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    
    const dayName = dayNames[now.getDay()];
    const day = now.getDate();
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();
    
    const formattedDate = `${day} ${month} ${year}`;
    
    return {
        dayName,
        formattedDate,
    };
}
