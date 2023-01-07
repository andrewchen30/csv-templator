# CSV-Templator

A easy CSV template render using 2D table to implement your own code logic

## Pain point

- Coding of CSV importer/exporter is tedious.
- Schemas of CSV importer/exporter are hard to read and maintain
- Render(format) logic, data adjustment logic, and business logic all mix together

---

# Develop Guide

Internal flow

```mermaid
flowchart

Input1[Input]
--> |InputParser| B(Get RawSchema)
--> |SchemaParser| C(Get Schema)
--> D(Execute render)
--> |Renderer| Output[Output CSV String]

Input2[Data] --> D

style Input1 stroke:#85a67e,stroke-width:2px
style Input2 stroke:#85a67e,stroke-width:2px
style Output stroke:#a1b2d6,stroke-width:3px
```
