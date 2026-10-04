// Public configuration only. Never put credentials, access tokens, ticket data or people data here.
// Ticket URLs are navigation links to authenticated SharePoint pages; the portal never reads ticket data.
export default Object.freeze({
  enabled: true,
  contentRevision: "2026-10-03-seed-1",
  ticketsEnabled: true,
  ticketingPageUrl: "https://ep.europa.kiwi/sharepoint-ticketing/",
  ticketsUrl: "https://europarl.sharepoint.com/sites/learn.IT-Kiwi/Lists/EuropaTickets/AllItems.aspx",
  ticketAgentsUrl: "https://europarl.sharepoint.com/sites/learn.IT-Kiwi/Lists/TicketExchanges/AllItems.aspx"
});