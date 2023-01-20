# CSV-Templator

A easy CSV template render using 2D table to implement your own code logic

## Pain point

- Coding of CSV importer/exporter is tedious.
- Schemas of CSV importer/exporter are hard to read and maintain
- Render(format) logic, data adjustment logic, and business logic all mix together

## Get start

<details>
<summary>Example data set</summary>

```json
[
  {
    "firstName": "James",
    "lastName": "Butt",
    "companyName": "Benton, John B Jr",
    "address": "6649 N Blue Gum St",
    "city": "New Orleans",
    "county": "Orleans",
    "state": "LA",
    "zip": 70116,
    "phone1": "504-621-8927",
    "phone2": "504-845-1427",
    "email": "jbutt@gmail.com",
    "web": "http://www.bentonjohnbjr.com"
  }
  // ...
]
```

</details>

### Render CSV row by row

| Purchase member data  |                          |         |
| --------------------- | ------------------------ | ------- |
|                       | "name"                   | "email" |
| // for-row u in users | u.firstName + u.lastName | u.email |

Output:

```csv
name,email
JosephineDarakjy,josephine_darakjy@darakjy.org
ArtVenere,art@venere.org
LennaPaprocki,lpaprocki@hotmail.com
DonetteFoller,donette.foller@cox.net
```

<details>
<summary>Raw table string</summary>

```txt
|                       | "name"                   | "email" |
| // for-row u in users | u.firstName + u.lastName | u.email |
```

</details>

### Dynamic columns

| Email Domain in Each City |             |                                                                    |
| ------------------------- | ----------- | ------------------------------------------------------------------ |
|                           |             | // for-col domain in mailDomains                                   |
|                           | "City Name" | domain                                                             |
| // for-row c in cities    | c.name      | c.groupedByDomain[domain] ? c.groupedByDomain[domain].length : '-' |

Output:

```csv
City Name,darakjy.org,venere.org,hotmail.com,cox.net,morasca.com,yahoo.com,aol.com,rim.org,royster.com,slusarski.com,caudy.org,chui.com,corrio.com,vocelka.com,glick.com,shinko.com,ostrosky.com,perin.org,saylors.org,briddick.com,bowley.org,uyetake.org,mastella.com,monarrez.org,vanausdal.org,hollack.org,lindall.com,yglesias.com,mondella.com,rhym.com,reitler.com,crupi.com,mulqueen.org,honeywell.com,dickerson.org,barfield.com,gato.org,centini.org,buemi.com,cronauer.com,felger.org,miceli.org,shin.com,schmierer.org,kulzer.org,palaspas.org,perez.org,shire.com,spickerman.com,mirafuentes.com,klimek.org,zane.com,kohnert.com,gellinger.com,frey.com,haroldson.org,craghead.org,parvis.com,deleo.com,degroot.org,hoa.org,cousey.org,degonia.org,cookey.org,poullion.com,melnyk.com,toyama.org,caiafa.org,pelkowski.org,emard.com,konopacki.org,silvestrini.com,gesick.org,lother.com,brossart.com,tegarden.com,gobern.org,saulter.com,malvin.com,suffield.org,fishburne.com,loader.com,burnard.com,setter.org,worlds.com,arias.org,dopico.org,hellickson.org,staback.com,fortino.com,engelberg.org,zurcher.org,denooyer.org,restrepo.com,sweigard.com,nicolozakes.org,pontoriero.com,aquas.com,regusters.com,hauenstein.org,brachle.org,canlas.com,lietz.com,vonasek.org,julia.org,loder.org,patak.org,beech.com,yaw.org,semidey.com,paa.com,dorshorst.org,daufeldt.com,scipione.com,kitty.com,schoeneck.org,newville.com,mccullan.com,walthall.org,berlanga.com,meteer.com,nayar.com,sarao.org,onofrio.com,angalich.com,lapage.com,villanueva.com,perruzza.com,galam.org,lipkin.com,grenet.org,mclaird.com,colaizzo.com,koppinger.com,dewar.com,arceo.org,chaffins.org,nunlee.org,chavous.org,jacobos.com,similton.com,ankeny.org,hixenbaugh.org,gillaspie.com,kampa.org
Brighton,1,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-
Bridgeport,-,1,-,-,-,-,1,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-
Anchorage,-,-,1,1,-,-,1,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,1,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-
Hamilton,-,-,-,1,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-,-
```

<details>
<summary>Raw table string</summary>

```txt
|                           |             | // for-col domain in mailDomains                                   |
|                           | "City Name" | domain                                                             |
| // for-row c in cities    | c.name      | c.groupedByDomain[domain] ? c.groupedByDomain[domain].length : '-' |
```

</details>
