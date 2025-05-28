# Freehand handling

https://github.com/user-attachments/assets/1622f875-2ea2-4902-8430-e1ef308aa781

This project is my experiment on handling freehand drawing with SVG path.

It focuses on converting raw pointer points(from users) into usable SVG paths, so that it can be drawn graphically. Example use cases are note apps, drawing apps, etc.

Codes in this repository are not meant to be used directly on actual projects, but I am willing to make a separate library for this mechanism if it gets more stable.

## How does it work?

![image](https://github.com/user-attachments/assets/41082b6e-913e-41aa-ab28-f3ea104b01f4)

This image shows how SVG path is structured(I used *Figma* for SVG parsing).

![image](https://github.com/user-attachments/assets/f7cc2cdd-c93b-4cb0-955f-4f7e7ec6ad40)

To implement round linecap, every two neighboring points form one line. This is what is different from other libraries that actually draws outlines of the path.

![image](https://github.com/user-attachments/assets/9e8789d5-e284-44b1-af88-7a72f454bd00)

These three SVG points(points of SVG file) on each pointer points(raw input points from user) makes up the line cap. These are defined as `circlePoints`(or similarly) inside the JS code.

https://github.com/user-attachments/assets/490e742a-02ba-4dd1-9690-50a62717fec3

This is how the SVG points are made up(I used *Inkscape* for this one).

## To-do

![image](https://github.com/user-attachments/assets/d57eab65-b205-4ed4-99d3-4c5ade9f3efd)

There needs a way to smooth the lines. Currently the lines appear linear.

## Developing

### Installing modules

```
pnpm install
```

### Starting the development server

```
pnpm run dev
# or
pnpm run dev --host
```

Use the second one with `--host` flag to connect to the dev server from other devices in local network. I recommend testing the pressure-sensitive drawing on devices with stylus support, like iPad with Apple Pencil.
