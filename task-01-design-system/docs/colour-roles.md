# Colour Roles

## 1. Brand Colour

The primary brand colour is **`#0F6E56`**. This deep green-teal provides
a grounded, confident visual identity. Green is commonly associated with
growth, balance, and wellbeing, while the darker teal character gives
the interface a professional, composed feel. Together, these qualities
suit the goal of Nucleobridge as a digital product that users can depend on and approach without relying on an overly bright or distracting brand colour. The colour also provides a clear anchor for the primary tonal palette and for consistent use across interface elements.

## 2. Pinning the Primary Colour

The primary colour, `#0F6E56`, was pinned to **Primary 40** while generating the tonal palettes using Claude so that the generated tonal palette retains the selected brand colour at that tone rather than substituting a nearby value. This keeps the chosen brand colour exact and gives the rest of the palette a consistent reference point from which to generate tonal variations.

**Visible difference:** Before pinning, the generated palette determined
the value assigned to Tone 40 (`#086B53`), which differed from the intended brand colour. After pinning, Tone 40 is anchored to `#0F6E56`. However, the visible change was limited to only Tone 40, other generated tones were the same for both the pinned and unpinned versions.

## 3. Tonal Palettes

The documented tonal scale contains 14 tones:

`0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100`

The system uses the following tonal palettes:

-   **Primary** -- the primary color will also be used for success indicators
-   **Secondary**
-   **Tertiary**
-   **Neutral**
-   **Neutral Variant**
-   **Error**
-   **Warning**

Fourteen tones provide a practical range from the darkest to the
lightest values, with additional near-white steps at 95, 98, and 99 for
subtle surface distinctions. This is enough to support the main contrast
needs of light and dark themes from a shared palette source: darker
tones can serve prominent elements and content in light themes, while
lighter tones can provide readable foregrounds and selected containers
in dark themes. The same tonal families can be reused for surfaces,
text, borders, containers, and states, reducing the need to define every
interface colour independently. 
Some role mappings reference additional neutral tones beyond the original 14-tone scale, including Neutral 4, 6, 12, 17, 22, 24, 87, 92, 94, and 96. These additional tones were introduced to provide greater colour flexibility and finer control over contrast and visual hierarchy, particularly when designing neutral surfaces and layered interface elements.

## 4. Functional Colours

Functional colours communicate interface states and help users
understand what is happening. They should be distinguishable from one
another and should not rely on colour alone to convey meaning; that is, they should be paired with appropriate text, icons, or other visual indicators. Functional colors were defined as thus: Error (for failures, invalid input, and actions that requrie correction), Warning (for potential problems, caution, or tone conditions that need attention). For Success indicators (completion of an event or a positive outcome), the brand color will be used.

## 5. Colour Roles

A colour role defines the job a colour performs in the interface. Each
role points to a value from a tonal palette rather than requiring a
separately chosen colour. The tables below record the supplied Light and
Dark theme assignments. Verify the assignments against the actual Figma
palette before implementation.

### Primary Roles

  -----------------------------------------------------------------------
  Role              Purpose           Light theme       Dark theme
  ----------------- ----------------- ----------------- -----------------
  Primary           Main brand colour Primary 40        Primary 80
                    for prominent                       
                    actions and                         
                    emphasis                            

  On Primary        Text and icons    Primary 100       Primary 20
                    placed on Primary                   

  Primary Container Background for    Primary 90        Primary 30
                    less prominent                      
                    primary actions                     
                    or grouped                          
                    content                             

  On Primary        Content placed on Primary 30        Primary 90
  Container         Primary Container                   

  Inverse Primary   Primary colour    Primary 80        Primary 40
                    used in                             
                    inverse-colour                      
                    contexts                            
  -----------------------------------------------------------------------

### Secondary Roles

  -----------------------------------------------------------------------
  Role              Purpose           Light theme       Dark theme
  ----------------- ----------------- ----------------- -----------------
  Secondary         Supporting colour Secondary 40      Secondary 80
                    for actions and                     
                    emphasis                            

  On Secondary      Content placed on Secondary 100     Secondary 20
                    Secondary                           

  Secondary         Background for    Secondary 90      Secondary 30
  Container         supporting                          
                    actions or                          
                    grouped content                     

  On Secondary      Content placed on Secondary 30      Secondary 90
  Container         Secondary                           
                    Container                           
  -----------------------------------------------------------------------

### Tertiary Roles

  -----------------------------------------------------------------------
  Role              Purpose           Light theme       Dark theme
  ----------------- ----------------- ----------------- -----------------
  Tertiary          Additional accent Tertiary 40       Tertiary 80
                    colour for visual                   
                    distinction                         

  On Tertiary       Content placed on Tertiary 100      Tertiary 20
                    Tertiary                            

  Tertiary          Background for    Tertiary 90       Tertiary 30
  Container         tertiary actions                    
                    or grouped                          
                    content                             

  On Tertiary       Content placed on Tertiary 30       Tertiary 90
  Container         Tertiary                            
                    Container                           
  -----------------------------------------------------------------------

### Error Roles

  -----------------------------------------------------------------------
  Role              Purpose           Light theme       Dark theme
  ----------------- ----------------- ----------------- -----------------
  Error             Communicates      Error 40          Error 80
                    errors and                          
                    invalid states                      

  On Error          Content placed on Error 100         Error 20
                    Error                               

  Error Container   Background for    Error 90          Error 30
                    error messages or                   
                    error-related                       
                    content                             

  On Error          Content placed on Error 30          Error 90
  Container         Error Container                     
  -----------------------------------------------------------------------

### Warning Roles

  -----------------------------------------------------------------------
  Role              Purpose           Light theme       Dark theme
  ----------------- ----------------- ----------------- -----------------
  Warning           Communicates      Warning 40        Warning 80
                    caution or                          
                    potential                           
                    problems                            

  On Warning        Content placed on Warning 100       Warning 20
                    Warning                             

  Warning Container Background for    Warning 90        Warning 30
                    warning messages                    
                    or cautionary                       
                    content                             

  On Warning        Content placed on Warning 30        Warning 90
  Container         Warning Container                   
  -----------------------------------------------------------------------

### Surface and Background Roles

  -----------------------------------------------------------------------
  Role              Purpose           Light theme       Dark theme
  ----------------- ----------------- ----------------- -----------------
  Background        Main background   Neutral 98        Neutral 6
                    behind                              
                    application                         
                    content                             

  On Background     Text and icons    Neutral 10        Neutral 90
                    displayed on                        
                    Background                          

  Surface           Default           Neutral 98        Neutral 6
                    background for                      
                    interface                           
                    components                          

  On Surface        Main text and     Neutral 10        Neutral 90
                    icons on surfaces                   

  Surface Variant   Alternative       Neutral Variant   Neutral Variant
                    surface for       90                30
                    visual grouping                     

  On Surface        Secondary content Neutral Variant   Neutral Variant
  Variant           on variant        30                80
                    surfaces                            

  Surface Bright    Brighter surface  Neutral 98        Neutral 24
                    for layered                         
                    interface                           
                    contexts                            

  Surface Dim       Dimmed surface    Neutral 87        Neutral 6
                    for layered                         
                    interface                           
                    contexts                            

  Inverse Surface   Surface with      Neutral 20        Neutral 90
                    contrasting                         
                    treatment to the                    
                    default surface                     

  Inverse On        Content placed on Neutral 95        Neutral 20
  Surface           Inverse Surface                     

  Surface Tint      Applies a         Primary 40        Primary 80
                    brand-colour tint                   
                    to surfaces where                   
                    needed                              
  -----------------------------------------------------------------------

### Surface Container Roles

Surface container roles establish different levels of tonal separation
between interface layers.

  ------------------------------------------------------------------------
  Role              Purpose            Light theme       Dark theme
  ----------------- ------------------ ----------------- -----------------
  Surface Container Lowest-emphasis    Neutral 100       Neutral 4
  Lowest            container surface                    

  Surface Container Low-emphasis       Neutral 96        Neutral 10
  Low               container surface                    

  Surface Container Standard container Neutral 94        Neutral 12
                    surface                              

  Surface Container Higher-emphasis    Neutral 92        Neutral 17
  High              container surface                    

  Surface Container Highest-emphasis   Neutral 90        Neutral 22
  Highest           container surface                    
  ------------------------------------------------------------------------

### Fixed Roles

Fixed roles retain the same tonal assignment in both themes. They can
help maintain consistent colour treatment when content should remain
visually stable across light and dark modes.

  ------------------------------------------------------------------------
  Role              Purpose            Light theme       Dark theme
  ----------------- ------------------ ----------------- -----------------
  Primary Fixed     Fixed              Primary 90        Primary 90
                    primary-colour                       
                    container                            

  On Primary Fixed  Content on Primary Primary 10        Primary 10
                    Fixed                                

  Primary Fixed Dim Dimmer fixed       Primary 80        Primary 80
                    primary container                    

  On Primary Fixed  Variant content on Primary 30        Primary 30
  Variant           Primary Fixed                        

  Secondary Fixed   Fixed              Secondary 90      Secondary 90
                    secondary-colour                     
                    container                            

  On Secondary      Content on         Secondary 10      Secondary 10
  Fixed             Secondary Fixed                      

  Secondary Fixed   Dimmer fixed       Secondary 80      Secondary 80
  Dim               secondary                            
                    container                            

  On Secondary      Variant content on Secondary 30      Secondary 30
  Fixed Variant     Secondary Fixed                      

  Tertiary Fixed    Fixed              Tertiary 90       Tertiary 90
                    tertiary-colour                      
                    container                            

  On Tertiary Fixed Content on         Tertiary 10       Tertiary 10
                    Tertiary Fixed                       

  Tertiary Fixed    Dimmer fixed       Tertiary 80       Tertiary 80
  Dim               tertiary container                   

  On Tertiary Fixed Variant content on Tertiary 30       Tertiary 30
  Variant           Tertiary Fixed                       
  ------------------------------------------------------------------------

### Utility Roles

  -----------------------------------------------------------------------
  Role              Purpose           Light theme       Dark theme
  ----------------- ----------------- ----------------- -----------------
  Outline           Borders and       Neutral Variant   Neutral Variant
                    component         80                60
                    boundaries that                     
                    need clear                          
                    definition                          

  Outline Variant   Subtler borders   Neutral Variant   Neutral Variant
                    and dividers      90                30

  Scrim             Overlay used to   Neutral 0         Neutral 0
                    dim background                      
                    content behind                      
                    modal elements                      

  Shadow            Colour used for   Primary 10        Primary 10
                    interface shadows                   
  -----------------------------------------------------------------------

## 6. Implementation 

Each interface component would use the role that matches its purpose
rather than a hard-coded colour value. For example, primary actions
would reference **Primary**, their foreground content would reference
**On Primary**, and page content would use the appropriate surface and
on-surface roles.

# 7. Contrast Validation

The A11y - Color Contrast Checker was used to validate all role pairs. All tested texts met the requirements and successfully crossed the threshold for AAA compliance (AAA compliant: 4.5:1 for large fonts 19px+).

The following specific text-to-background role pairs were checked and validated:
*   **On Secondary** (text on its respective background)
*   **On Primary Container** (text on its respective container background)
*   **On Secondary Container** (text on its respective container background)
*   **On Tertiary** (text on its respective background)
*   **On Tertiary Container** (text on its respective container background)
