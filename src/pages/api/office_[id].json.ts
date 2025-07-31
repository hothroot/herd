import type { APIRoute } from "astro";
import xml2js from "xml2js";
/**
 * yes, yes:
 *   https://www.kalzumeus.com/2010/06/17/falsehoods-programmers-believe-about-names/
 * but a lot of these assumptions are baked into these two 
 * sources already, so I'm kind of stuck.
 * 
 * If this blows up during a build it could be because the format of 
 * the XML file has changed, or maybe the file has disappeared altogether.
 */

const request = await fetch('https://www.senate.gov/general/contact_information/senators_cfm.xml')
const phonebookXml = await request.text();
var phonebook = {};
xml2js.parseString(phonebookXml, function (err, result) {
    phonebook = result;
});
const officeData = phonebook.contact_information.member.map(member => {
  const firstName = member.first_name[0];
  const lastName = member.last_name[0];
  const fullname = `${firstName} ${lastName}`
  const state = member.state[0];
  var address = member.address[0];
  address = address.substring(0, address.indexOf(' Washington'));
  return [`${lastName} ${state}`.replace(/ /g, '_'), [fullname, address] ];
});
const offices = new Map(officeData);

export const GET: APIRoute = ({ params, request }) => {
  const id = params.id ? params.id : "unknown";

  return new Response(
    JSON.stringify({
      id: id,
      fullname: offices.get(id)[0],
      office: offices.get(id)[1],
    }),
  );
};

export function getStaticPaths() {
   return [...offices.keys()].map(id => { return { params: { id: id} } });
}
