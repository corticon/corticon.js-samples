

By default, response data is stored in an entity assigned to be the pathToData, using the attribute `UI.pathToData` .

For example, if we're building auto insurance form, when we're collecting information about the Vehicle, we might assign the 'vehicle' entity to be the vocabulary entity / JSON object within which the accrued data will be stored:

![](images/pathtodata.PNG)

If we start by just collecting the end user's responses for year/make/model of a vehicle, the accrued data would look something like:

```
    {
      "vehicle": {
        "year": 2020,
        "make": "Mazda",
        "model": "Cx-3 4Dr Awd"
      }
    }
```
