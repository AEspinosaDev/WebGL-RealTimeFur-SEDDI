# Real Time Fur in WebGL SEDDI

* You can check this demo on the webpage. Works in latest navigators. https://aespinosadev.github.io/WebGL-RealTimeFur-SEDDI/
* Comb fur functionality and completely customizable!
* This project is being migrated to ThreeJS platform. Future improvements will be added to this other repository. https://github.com/AEspinosaDev/ThreeJS-RealTimeFur-SEDDI.git
* In the next few months a memory will be added explaining the ins and outs of this project.

<h4>The implemented fur rendering method is described in this paper: https://hhoppe.com/fur.pdf.</h4>

For rendering shells it uses WebGL instance rendering, fins are precomputed at mesh load and combing is achieved using transform feedbacks where new hair direction is computed and stored.



<h2>Future improvements</h2> 

  * Better image sampling for less aliasing. (specially in sub-pixel fin rendering)

  * Use geometric hair model to sample shell and fins textures on the fly. (Right now it uses a procedural perlin noise texture computed on the fly for the shell texture    and a precomputed fin texture)

  * Use a better shading algorythm. (Right now uses a slightly modified Kajiya´s method, which is not physically based and has a lot of short-commings)

* Support for mobile-phones.
<h2>Screenshots</h2>






![Screenshot 2023-03-03 125110](https://user-images.githubusercontent.com/79087129/222713765-d4a107fb-fddd-414e-b368-173d93ea27ec.png)
![Screenshot 2023-03-03 125612](https://user-images.githubusercontent.com/79087129/222714422-a44861be-5b0b-4a80-83a5-c67d1e50476a.png)

## Used Libraries

* Twitter Bootstrap used under the MIT License https://github.com/twbs/bootstrap/blob/master/LICENSE
* Material Icons by Google used under Apache License https://design.google.com/icons/
* bootstrap-slider by Kyle Kemp, Rohit Kalkur, and contributors used under MIT License https://github.com/seiyria/bootstrap-slider
* RequireJS, Released under the  MIT license https://github.com/requirejs/requirejs/blob/master/LICENSE
* jQuery used under the MIT license https://jquery.org/license/
* gl-matrix, a high performance matrix and vector operations by Brandon Jones and Colin MacKenzie IV
* WebGL initialization code is based on http://learningwebgl.com/ tutorials
* Basic low-level WebGL framework - https://github.com/keaukraine/webgl-framework
* Basic hair functionality from https://github.com/keaukraine/webgl-fur and heavily modified and expanded for research purposes.
