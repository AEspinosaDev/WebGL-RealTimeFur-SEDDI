# WebGL-RealTimeFur-SEDDI

<h3>You can check this demo on the webpage.</h3>
<h3>Comb fur functionality and completely customizable!</h3>
<h3>This project is being migrated to ThreeJS platform. Future improvements will be added to this other repository.</h3>

<h3>The implemented fur rendering method is described in this paper: https://hhoppe.com/fur.pdf.</h3>

<h2></h2>

<h4>Future improvements:</h4> 

  -Better image sampling for less aliasing. (specially in sub-pixel fin rendering)

  -Use geometric hair model to sample shell and fins textures on the fly. (Right now it uses a procedural perlin noise texture computed on the fly for the shell texture    and a precomputed fin texture)

  -Use a better shading algorythm. (Right now uses a slightly modified Kajiya´s method, which is not physically based and has a lot of short-commings)

<h2></h2>

SEDDI Render Research Team.


Base functionality from https://github.com/keaukraine/webgl-fur and modified and expanded for research purposes.

![Screenshot 2023-03-03 125110](https://user-images.githubusercontent.com/79087129/222713765-d4a107fb-fddd-414e-b368-173d93ea27ec.png)
![Screenshot 2023-03-03 125612](https://user-images.githubusercontent.com/79087129/222714422-a44861be-5b0b-4a80-83a5-c67d1e50476a.png)
