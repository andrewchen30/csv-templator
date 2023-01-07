# CSV-Templator

---

A easy CSV template render using 2D table to implement your own code logic

## Pain point

- Coding of CSV importer/exporter is tedious.
- Schemas of CSV importer/exporter are hard to read and maintain
- Render(format) logic, data adjustment logic, and business logic all mix together

# Develope

Internal flow

```mermaid
flowchart

Input1[Input]
--> |InputParser| B(Get RawSchema)
--> |SchemaParser| C(Get Schema)
--> D(Execute render)
--> |Renderer| Output[Output CSV String]

Input2[Data] --> D
style Input1 fill:#85a67e
style Input2 fill:#85a67e
style Output fill:#a1b2d6
```
