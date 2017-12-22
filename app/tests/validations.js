//validation test
//https://repl.it/repls/TrustworthyHugeGalapagospenguin
//demonstrates the parseValidation output

//this is the output we would get from the Validation column of a field
// as given to us from CellValidator.prototype.getValidationsArray  (datasheet-cell-validators.js)
var validations =
    [
        'required',
        'int(4)',
        'int',
        'float',
        'float(3)',
        'float(5,2)',
        'year',
        '[200,500]'
    ];

var parsed_validations = [];

var rangeRegex = new RegExp(/\[\d*\,\d*\]$/);
var validationMatchers =
    [
        new RegExp(/^(int)\((\d)\)$/), //int(4)
        new RegExp(/^(int)$/),         //int
        new RegExp(/^(float)$/),         //float
        new RegExp(/^(float)\(()(\d)\)$/), //float(4)
        new RegExp(/^(float)\((\d)\,(\d)\)$/),    //float(5,2)
    ];

//for each validation rule, try to match it with
//  one of our regex patterns and produce an array
//  we can use to validate values later.
function parseValidations(validations) {
    validations.forEach(function (val) {
        var matched = false;

        //range
        if (rangeRegex.test(val)) {
            var obj = rangeRegex.exec(val);
            parsed_validations.push({
                number: {
                    'num_type': 'range',
                    'num_range': val,
                }
            });
            matched = true;
        }

        //floats and ints
        validationMatchers.forEach(function (regex) {
            if (regex.test(val)) {
                var obj = regex.exec(val);
                parsed_validations.push({
                    number: {
                        'num_type': obj[1],
                        'num_length': (obj[2] === '') ? undefined : obj[2], //return undefined, not ''
                        'num_decimal': obj[3],
                        'original': obj.input,
                    }
                });
                //console.log(" -- match --");
                //console.dir(obj);
                //console.dir(val);
                matched = true;
            }
        });

        if (!matched) {
            parsed_validations.push(val);
        }
    });
}

parseValidations(validations);
console.dir(parsed_validations);


// outputs:

/*

[ 'required',
  { number:
     { num_type: 'int',
       num_length: '4',
       num_decimal: undefined,
       original: 'int(4)' } },
  { number:
     { num_type: 'int',
       num_length: undefined,
       num_decimal: undefined,
       original: 'int' } },
  { number:
     { num_type: 'float',
       num_length: undefined,
       num_decimal: undefined,
       original: 'float' } },
  { number:
     { num_type: 'float',
       num_length: undefined,
       num_decimal: '3',
       original: 'float(3)' } },
  { number:
     { num_type: 'float',
       num_length: '5',
       num_decimal: '2',
       original: 'float(5,2)' } },
  'year',
  { number: { num_type: 'range', num_range: '[200,500]' } } ]

*/