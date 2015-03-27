#!/usr/bin/petite --script

(load "base.ss")
(define name "data-01")
(define db (load-db name))

(define show-ascend
  (lambda (records)
    (display "{\"vocabulary\":[")
    (map
     (lambda (record)
       (display "{\"name\":\"")
       (display (vector-ref record 1))
       (display "\",\"pronunciation_uk\":\"")
       (display (vector-ref record 2))
       (display "\",\"sound_uk\":\"")
       (display (vector-ref record 3))
       (display "\",\"pronunciation_us\":\"")
       (display (vector-ref record 4))
       (display "\",\"sound_us\":\"")
       (display (vector-ref record 5))
       (display "\"},")
       ) 
     records)
    (display "{}]}")))

(define show-descend
  (lambda (records)
    (string-append "{\"vocabulary\":["
		   (let loop ((ls records))
		     (cond
		      ((null? ls) "{}]}")
		      (else
		       (let ((record (car ls)))
			 (string-append "{\"name\":\"" (vector-ref record 1)
					"\",\"pronunciation_uk\":\"" (vector-ref record 2)
					"\",\"sound_uk\":\"" (vector-ref record 3)
					"\",\"pronunciation_us\":\"" (vector-ref record 4)
					"\",\"sound_us\":\"" (vector-ref record 5)
					"\",\"definition\":\"" (vector-ref record 6)
					"\"},"
					(loop (cdr ls))))))))))

(display (show-descend (get-records db)))
